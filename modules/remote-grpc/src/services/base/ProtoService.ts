import { join, resolve } from "path";
import { inject } from "../../core/di";

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

import { get } from "../../utils/get";

import { CC_GRPC_MAP, CC_GRPC_PROTO_PATH } from "../../config/params";

import type LoggerService from "./LoggerService";

import TYPES from "../../config/types";

const GRPC_READY_DELAY = 15_000;

const readProto = (name: string) => {
  const absolutePath = resolve(join(CC_GRPC_PROTO_PATH, `${name}.proto`));
  console.log(`Using proto ${absolutePath}`);
  const packageDefinition = protoLoader.loadSync(
    absolutePath
  );
  return grpc.loadPackageDefinition(packageDefinition);
};

const promisifyMethod =
  <T = unknown>(grpcMethod: Function) =>
  (request: Record<string, unknown>) => {
    return new Promise((resolve, reject) => {
      grpcMethod(request, (error: Error, response: T) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  };

type Ctor = new (...args: any[]) => any;
type ServiceName = keyof typeof CC_GRPC_MAP;

interface IService {
  [key: string | number | symbol]: Function;
}

export class ProtoService {

  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private readonly _protoMap = new Map<string, grpc.GrpcObject>();

  loadProto = (protoName: string) => {
    return this._protoMap.has(protoName)
      ? this._protoMap.get(protoName)!
      : this._protoMap.set(protoName, readProto(protoName)).get(protoName)!;
  };

  makeClient = <T = IService>(serviceName: ServiceName) => {
    const { grpcHost, protoName, methodList } = CC_GRPC_MAP[serviceName];
    const proto = this.loadProto(protoName);
    const Ctor = get(proto, serviceName) as unknown as Ctor;
    const grpcClient = new Ctor(grpcHost, grpc.credentials.createInsecure());

    grpcClient.waitForReady(Date.now() + GRPC_READY_DELAY, (err: Error) => {
      if (err) {
        this.loggerService.log(`remote-grpc protoService failed to connect to ${serviceName} due to timeout`);
        throw err;
      }
    });
  
    return methodList.reduce<T>(
      (acm, cur) => {
        const grpcMethod = promisifyMethod(get(grpcClient, cur).bind(grpcClient));
        return {
          ...acm,
          [cur]: async (request: Record<string, unknown>) => {
            this.loggerService.log(`remote-grpc protoService makeClient calling service=${serviceName} method=${cur}`, { request });
            return await grpcMethod(request);
          },
        }
      },
      {} as unknown as T
    );
  };

  makeServer = <T extends IService = IService>(serviceName: ServiceName, connector: T) => {
    const { grpcHost, protoName, methodList } = CC_GRPC_MAP[serviceName];
    const proto = this.loadProto(protoName);

    const serviceInstance = methodList.reduce((acm, cur) => {
      const executor = get(connector, cur).bind(connector);
      return {
        ...acm,
        [cur]: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
          this.loggerService.log(`remote-grpc protoService makeServer executing method service=${serviceName} method=${cur}`, { request: call.request });
          try {
            const result = await executor(call.request);
            callback(null, result || {});
          } catch (error) {
            callback(error as grpc.ServiceError, null);
          }
        },
      };
    }, {} as grpc.UntypedServiceImplementation);

    const server = new grpc.Server();
    server.addService(get(proto, `${serviceName}.service`) as unknown as grpc.ServiceDefinition, serviceInstance);
    server.bindAsync(grpcHost, grpc.ServerCredentials.createInsecure(), (error) => {
      if (error) {
        throw new Error(`Failed to serve ${serviceName}, host=${grpcHost}`)
      }
    });
  };
}

export default ProtoService;
