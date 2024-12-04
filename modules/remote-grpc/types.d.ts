import * as grpc$1 from '@grpc/grpc-js';
import { CC_GRPC_MAP as CC_GRPC_MAP$1 } from 'src/config/params';
import { CANCELED_PROMISE_SYMBOL } from 'functools-kit';

declare class LoggerService {
    private _logger;
    log: (...args: any[]) => void;
    setPrefix: (prefix: string) => void;
}

declare const CC_GRPC_MAP: {
    readonly FooService: {
        readonly grpcHost: "localhost:50051";
        readonly protoName: "foo_service";
        readonly methodList: readonly ["Execute"];
    };
    readonly BarService: {
        readonly grpcHost: "localhost:50052";
        readonly protoName: "bar_service";
        readonly methodList: readonly ["Execute"];
    };
    readonly BazService: {
        readonly grpcHost: "localhost:50053";
        readonly protoName: "baz_service";
        readonly methodList: readonly ["Execute"];
    };
    readonly MessageService: {
        readonly grpcHost: "localhost:50054";
        readonly protoName: "message_service";
        readonly methodList: readonly ["connect"];
    };
};

type ServiceName$1 = keyof typeof CC_GRPC_MAP;
interface IService {
    [key: string | number | symbol]: Function;
}
declare class ProtoService {
    private readonly loggerService;
    private readonly _protoMap;
    loadProto: (protoName: string) => grpc$1.GrpcObject;
    makeClient: <T = IService>(serviceName: ServiceName$1) => T;
    makeServer: <T = IService>(serviceName: ServiceName$1, connector: T) => void;
}

declare class ErrorService {
    handleGlobalError: (error: Error) => never;
    private _listenForError;
    protected init: () => void;
}

type ServiceName = keyof typeof CC_GRPC_MAP$1;
interface IMessage<Data = object> {
    serviceName: string;
    clientId: string;
    userId: string;
    requestId: string;
    data: Data;
}
type SendMessageFn<T = object> = (outgoing: IMessage<T>) => Promise<void | typeof CANCELED_PROMISE_SYMBOL>;
interface IAwaiter {
    resolve(): void;
}
declare class StreamService {
    private readonly protoService;
    private readonly loggerService;
    _makeServerInternal: <T = object>(serviceName: ServiceName, connector: (incoming: IMessage<T>) => void, reconnect: (queue: [IMessage, IAwaiter][], error: boolean) => void, attempt: number, queue?: [IMessage, IAwaiter][]) => SendMessageFn<any>;
    _makeClientInternal: <T = object>(serviceName: ServiceName, connector: (incoming: IMessage<T>) => void, reconnect: (queue: [IMessage, IAwaiter][], error: boolean) => void, attempt: number, queue?: [IMessage, IAwaiter][]) => SendMessageFn<any>;
    makeServer: <T = object>(serviceName: ServiceName, connector: (incoming: IMessage<T>) => void) => SendMessageFn<any>;
    makeClient: <T = object>(serviceName: ServiceName, connector: (incoming: IMessage<T>) => void) => SendMessageFn<any>;
}

declare const grpc: {
    fooClientService: {
        readonly protoService: ProtoService;
        readonly loggerService: LoggerService;
        _fooClient: GRPC.IFooService;
        Execute: (...args: any) => Promise<any>;
        init: () => void;
    };
    barClientService: {
        readonly protoService: ProtoService;
        readonly loggerService: LoggerService;
        _barClient: GRPC.IBarService;
        Execute: (...args: any) => Promise<any>;
        init: () => void;
    };
    bazClientService: {
        readonly protoService: ProtoService;
        readonly loggerService: LoggerService;
        _bazClient: GRPC.IBazService;
        Execute: (...args: any) => Promise<any>;
        init: () => void;
    };
    protoService: ProtoService;
    loggerService: LoggerService;
    errorService: ErrorService;
    streamService: StreamService;
};

export { grpc };
