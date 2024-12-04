import TYPES from "./config/types";
import "./config/provide";
import { inject, init } from "./core/di";
import type LoggerService from "./services/base/LoggerService";
import ProtoService from "./services/base/ProtoService";
import type BarClientService from "./services/client/BarClientService";
import type BazClientService from "./services/client/BazClientService";
import type FooClientService from "./services/client/FooClientService";
import ErrorService from "./services/base/ErrorService";
import type StreamService from "./services/base/StreamService";
import type { TFooClientService } from "./services/client/FooClientService";
import type { TBarClientService } from "./services/client/BarClientService";
import type { TBazClientService } from "./services/client/BazClientService";

const baseServices = {
    protoService: inject<ProtoService>(TYPES.protoService),
    loggerService: inject<LoggerService>(TYPES.loggerService),
    errorService: inject<ErrorService>(TYPES.errorService),
    streamService: inject<StreamService>(TYPES.streamService),
};

const clientServices = {
    fooClientService: inject<TFooClientService>(TYPES.fooClientService),
    barClientService: inject<TBarClientService>(TYPES.barClientService),
    bazClientService: inject<TBazClientService>(TYPES.bazClientService),
};

init();

export const grpc = {
    ...baseServices,
    ...clientServices,
};
