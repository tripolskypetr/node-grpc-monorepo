import { provide } from '../core/di';

import TYPES from './types';

import ProtoService from '../services/base/ProtoService';
import FooClientService from '../services/client/FooClientService';
import BarClientService from '../services/client/BarClientService';
import BazClientService from '../services/client/BazClientService';
import LoggerService from '../services/base/LoggerService';

{
    provide(TYPES.protoService, () => new ProtoService());
    provide(TYPES.loggerService, () => new LoggerService());
}

{
    provide(TYPES.fooClientService, () => new FooClientService());
    provide(TYPES.barClientService, () => new BarClientService());
    provide(TYPES.bazClientService, () => new BazClientService());
}

