import { provide } from '../core/di';

import TYPES from './types';

import ProtoService from '../services/base/ProtoService';
import FooClientService from '../services/client/FooClientService';
import BarClientService from '../services/client/BarClientService';
import BazClientService from '../services/client/BazClientService';
import LoggerService from '../services/base/LoggerService';
import ErrorService from '../services/base/ErrorService';
import StreamService from 'src/services/base/StreamService';

{
    provide(TYPES.protoService, () => new ProtoService());
    provide(TYPES.loggerService, () => new LoggerService());
    provide(TYPES.errorService, () => new ErrorService());
    provide(TYPES.streamService, () => new StreamService());
}

{
    provide(TYPES.fooClientService, () => new FooClientService());
    provide(TYPES.barClientService, () => new BarClientService());
    provide(TYPES.bazClientService, () => new BazClientService());
}

