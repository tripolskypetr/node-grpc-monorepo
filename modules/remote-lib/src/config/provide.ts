import { provide } from '../core/di';

import TYPES from './types';

import LoggerService from '../services/base/LoggerService';

{
    provide(TYPES.loggerService, () => new LoggerService());
}
