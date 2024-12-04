import { inject } from "src/core/di";
import type ProtoService from "./ProtoService";
import type LoggerService from "./LoggerService";
import TYPES from "src/config/types";
import { CC_GRPC_MAP } from "src/config/params";
import get from "src/utils/get";
import * as grpc from "@grpc/grpc-js";
import {
  errorData,
  Subject,
  createAwaiter,
  queued,
  CANCELED_PROMISE_SYMBOL,
  singleshot,
  sleep,
} from "functools-kit";

type Ctor = new (...args: any[]) => grpc.Client;
type ServiceName = keyof typeof CC_GRPC_MAP;

const CHANNEL_OK_SYMBOL = Symbol("channel-ok");
const CHANNEL_ERROR_SYMBOL = Symbol("channel-error");

interface IMessage<Data = object> {
  serviceName: string;
  clientId: string;
  userId: string;
  requestId: string;
  data: Data;
}

export type SendMessageFn<T = object> = (
  outgoing: IMessage<T>
) => Promise<void | typeof CANCELED_PROMISE_SYMBOL>;

const GRPC_READY_DELAY = 15_000;

interface IAwaiter {
  resolve(): void;
}

export class StreamService {
  private readonly protoService = inject<ProtoService>(TYPES.protoService);
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  _makeServerInternal = <T = object>(
    serviceName: ServiceName,
    connector: (incoming: IMessage<T>) => void,
    reconnect: (queue: [IMessage, IAwaiter][], error: boolean) => void,
    attempt: number,
    queue?: [IMessage, IAwaiter][]
  ): SendMessageFn<any> => {
    this.loggerService.log(
      `remote-grpc streamService _makeServerInternal connecting service=${serviceName} attempt=${attempt}`
    );
    const { grpcHost, protoName } = CC_GRPC_MAP[serviceName];
    const proto = this.protoService.loadProto(protoName);

    let isClosed = false;
    const outgoingSubject = new Subject<void>();
    const outgoingQueue: [IMessage, IAwaiter][] = queue ? [...queue] : [];

    const errorSubject = new Subject<typeof CHANNEL_ERROR_SYMBOL>();
    const succeedSubject = new Subject<typeof CHANNEL_OK_SYMBOL>();

    const server = new grpc.Server();
    server.addService(
      get(proto, `${serviceName}.service`) as unknown as grpc.ServiceDefinition,
      {
        connect: (
          call: grpc.ServerWritableStream<IMessage<string>, IMessage<string>>
        ) => {
          call.on("data", (message: IMessage<string>) => {
            this.loggerService.log(
              `remote-grpc streamService makeServer incoming service=${serviceName}`,
              { incoming: message }
            );
            connector({
              clientId: message.clientId,
              data: JSON.parse(message.data),
              requestId: message.requestId,
              serviceName: message.serviceName,
              userId: message.userId,
            });
          });
          call.on("drain", () => {
            succeedSubject.next(CHANNEL_OK_SYMBOL);
          });
          call.on("end", () => {
            this.loggerService.log(
              `remote-grpc streamService Server stream end for ${serviceName}, host=${grpcHost}`
            );
            call.end();
            isClosed = true;
            errorSubject.next(CHANNEL_ERROR_SYMBOL);
            reconnect(outgoingQueue, false);
          });
          call.on("error", (err) => {
            this.loggerService.log(
              `remote-grpc streamService Server stream error for ${serviceName}, host=${grpcHost}, error=${errorData(err)}`
            );
            isClosed = true;
            errorSubject.next(CHANNEL_ERROR_SYMBOL);
            reconnect(outgoingQueue, true);
          });
          {
            const emit = async () => {
              while (outgoingQueue.length) {
                if (isClosed) {
                  break;
                }
                const [[outgoing, { resolve }]] = outgoingQueue;
                this.loggerService.log(
                  `remote-grpc streamService makeServer outgoing service=${serviceName}`,
                  { outgoing }
                );
                try {
                  call.write(
                    {
                      clientId: outgoing.clientId,
                      requestId: outgoing.requestId,
                      serviceName: outgoing.serviceName,
                      userId: outgoing.userId,
                      data: JSON.stringify(outgoing.data),
                    },
                    (err: any) => {
                      if (err) {
                        errorSubject.next(CHANNEL_ERROR_SYMBOL);
                        return;
                      }
                      succeedSubject.next(CHANNEL_OK_SYMBOL);
                    }
                  );
                  const result = await Promise.race([
                    errorSubject.toPromise(),
                    succeedSubject.toPromise(),
                  ]);
                  if (result === CHANNEL_ERROR_SYMBOL) {
                    break;
                  }
                  outgoingQueue.shift();
                  resolve();
                } catch (error) {
                  this.loggerService.log(
                    `remote-grpc streamService makeServer outgoing error service=${serviceName}`,
                    { outgoing: errorData(error) }
                  );
                }
              }
            };
            outgoingSubject.subscribe(emit);
            emit();
          }
        },
      }
    );

    server.bindAsync(
      grpcHost,
      grpc.ServerCredentials.createInsecure(),
      (error) => {
        if (error) {
          throw new (class extends Error {
            constructor() {
              super(
                `Failed to stream the server ${serviceName}, host=${grpcHost}`
              );
            }
            originalError = errorData(error);
          })();
        }
      }
    );

    return queued(async (outgoing: IMessage) => {
      const [pending, awaiter] = createAwaiter<void>();
      outgoingQueue.push([outgoing, awaiter]);
      outgoingSubject.next();
      return await pending;
    });
  };

  _makeClientInternal = <T = object>(
    serviceName: ServiceName,
    connector: (incoming: IMessage<T>) => void,
    reconnect: (queue: [IMessage, IAwaiter][], error: boolean) => void,
    attempt: number,
    queue?: [IMessage, IAwaiter][]
  ): SendMessageFn<any> => {
    this.loggerService.log(
      `remote-grpc streamService _makeClientInternal connecting service=${serviceName} attempt=${attempt}`
    );
    const { grpcHost, protoName } = CC_GRPC_MAP[serviceName];
    const proto = this.protoService.loadProto(protoName);
    const Ctor = get(proto, serviceName) as unknown as Ctor;
    const grpcClient = new Ctor(grpcHost, grpc.credentials.createInsecure());

    const outgoingSubject = new Subject<void>();
    const outgoingQueue: [IMessage, IAwaiter][] = queue ? [...queue] : [];
    let isClosed = false;

    const errorSubject = new Subject<typeof CHANNEL_ERROR_SYMBOL>();
    const succeedSubject = new Subject<typeof CHANNEL_OK_SYMBOL>();

    grpcClient.waitForReady(Date.now() + GRPC_READY_DELAY, (err) => {
      if (err) {
        throw new (class extends Error {
          constructor() {
            super(
              `Failed to listen the server ${serviceName}, host=${grpcHost}`
            );
          }
          originalError = errorData(err);
        })();
      }
      const fn = get(grpcClient, "connect").bind(grpcClient);
      const call = fn() as grpc.ClientWritableStream<IMessage<string>>;
      call.on("data", (message: IMessage<string>) => {
        this.loggerService.log(
          `remote-grpc streamService makeClient incoming service=${serviceName}`,
          { incoming: message }
        );
        connector({
          clientId: message.clientId,
          data: JSON.parse(message.data),
          requestId: message.requestId,
          serviceName: message.serviceName,
          userId: message.userId,
        });
      });
      call.on("drain", () => {
        succeedSubject.next(CHANNEL_OK_SYMBOL);
      });
      call.on("end", () => {
        this.loggerService.log(
          `remote-grpc streamService Client stream end for ${serviceName}, host=${grpcHost}`
        );
        call.end();
        isClosed = true;
        errorSubject.next(CHANNEL_ERROR_SYMBOL);
        reconnect(outgoingQueue, false);
      });
      call.on("error", (err) => {
        this.loggerService.log(
          `remote-grpc streamService Client stream error for ${serviceName}, host=${grpcHost}, error=${errorData(err)}`
        );
        isClosed = true;
        errorSubject.next(CHANNEL_ERROR_SYMBOL);
        reconnect(outgoingQueue, true);
      });
      {
        const emit = async () => {
          while (outgoingQueue.length) {
            if (isClosed) {
              break;
            }
            const [[outgoing, { resolve }]] = outgoingQueue;
            this.loggerService.log(
              `remote-grpc streamService makeClient outgoing service=${serviceName}`,
              { outgoing }
            );
            try {
              call.write(
                {
                  clientId: outgoing.clientId,
                  requestId: outgoing.requestId,
                  serviceName: outgoing.serviceName,
                  userId: outgoing.userId,
                  data: JSON.stringify(outgoing.data),
                },
                (err: any) => {
                  if (err) {
                    errorSubject.next(CHANNEL_ERROR_SYMBOL);
                    return;
                  }
                  succeedSubject.next(CHANNEL_OK_SYMBOL);
                }
              );
              const result = await Promise.race([
                errorSubject.toPromise(),
                succeedSubject.toPromise(),
              ]);
              if (result === CHANNEL_ERROR_SYMBOL) {
                break;
              }
              outgoingQueue.shift();
              resolve();
            } catch (error) {
              this.loggerService.log(
                `remote-grpc streamService makeServer outgoing error service=${serviceName}`,
                { outgoing: errorData(error) }
              );
            }
          }
        };
        outgoingSubject.subscribe(emit);
        emit();
      }
    });

    return queued(async (outgoing: IMessage) => {
      const [pending, awaiter] = createAwaiter<void>();
      outgoingQueue.push([outgoing, awaiter]);
      outgoingSubject.next();
      return await pending;
    });
  };

  makeServer = <T = object>(
    serviceName: ServiceName,
    connector: (incoming: IMessage<T>) => void
  ): SendMessageFn<any> => {
    this.loggerService.log(
      `remote-grpc streamService makeServer connecting service=${serviceName}`
    );
    let outgoingRef: SendMessageFn<any> = () => Promise.resolve();
    let attempt = 0;
    const makeConnection = (queue: [IMessage, IAwaiter][]) => {
      attempt += 1;
      outgoingRef = this._makeServerInternal(
        serviceName,
        connector,
        singleshot(makeConnection),
        attempt,
        queue
      );
    };
    makeConnection([]);
    return async (...args) => await outgoingRef(...args);
  };

  makeClient = <T = object>(
    serviceName: ServiceName,
    connector: (incoming: IMessage<T>) => void
  ): SendMessageFn<any> => {
    this.loggerService.log(
      `remote-grpc streamService makeClient connecting service=${serviceName}`
    );
    let outgoingRef: SendMessageFn<any> = () => Promise.resolve();
    let attempt = 0;
    const makeConnection = (queue: [IMessage, IAwaiter][]) => {
      attempt += 1;
      outgoingRef = this._makeClientInternal(
        serviceName,
        connector,
        singleshot(makeConnection),
        attempt,
        queue
      );
    };
    makeConnection([]);
    return async (...args) => await outgoingRef(...args);
  };
}

export default StreamService;
