import * as grpc$1 from '@grpc/grpc-js';

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
};

type ServiceName = keyof typeof CC_GRPC_MAP;
interface IService {
    [key: string | number | symbol]: Function;
}
declare class ProtoService {
    private readonly loggerService;
    private readonly _protoMap;
    loadProto: (protoName: string) => grpc$1.GrpcObject;
    makeClient: <T = IService>(serviceName: ServiceName) => T;
    makeServer: <T = IService>(serviceName: ServiceName, connector: T) => void;
}

declare class BarClientService implements GRPC.IBarService {
    private readonly protoService;
    private readonly loggerService;
    private _barClient;
    Execute: (...args: any) => Promise<any>;
    protected init: () => void;
}

declare class BazClientService implements GRPC.IBazService {
    private readonly protoService;
    private readonly loggerService;
    private _bazClient;
    Execute: (...args: any) => Promise<any>;
    protected init: () => void;
}

declare class FooClientService implements GRPC.IFooService {
    private readonly protoService;
    private readonly loggerService;
    private _fooClient;
    Execute: (...args: any) => Promise<any>;
    protected init: () => void;
}

declare class ErrorService {
    handleGlobalError: (error: Error) => never;
    private _listenForError;
    protected init: () => void;
}

declare const grpc: {
    fooClientService: FooClientService;
    barClientService: BarClientService;
    bazClientService: BazClientService;
    protoService: ProtoService;
    loggerService: LoggerService;
    errorService: ErrorService;
};

export { grpc };
