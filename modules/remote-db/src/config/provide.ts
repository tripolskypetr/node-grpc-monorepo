import { provide } from '../core/di';

import TYPES from './types';

import LoggerService from '../services/base/LoggerService';
import AppwriteService from '../services/base/AppwriteService';
import TodoViewService from '../services/view/TodoViewService';
import TodoDbService from '../services/db/TodoDbService';
import TodoRequestService from '../services/helper/TodoRequestService';
import ErrorService from '../services/base/ErrorService';
import ScopedService from 'src/services/sample/ScopedService';
import MockApiService from 'src/services/sample/MockApiService';

{
    provide(TYPES.loggerService, () => new LoggerService());
    provide(TYPES.appwriteService, () => new AppwriteService());
    provide(TYPES.errorService, () => new ErrorService());
}

{
    provide(TYPES.todoViewService, () => new TodoViewService());
}

{
    provide(TYPES.todoDbService, () => new TodoDbService());
}

{
    provide(TYPES.todoRequestService, () => new TodoRequestService());
}

{
    provide(TYPES.scopedService, () => new ScopedService());
    provide(TYPES.mockApiService, () => new MockApiService());
}
