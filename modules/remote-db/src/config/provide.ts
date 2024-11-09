import { provide } from '../core/di';

import TYPES from './types';

import LoggerService from '../services/base/LoggerService';
import AppwriteService from '../services/base/AppwriteService';
import TodoViewService from 'src/services/view/TodoViewService';
import TodoDbService from 'src/services/db/TodoDbService';
import TodoRequestService from 'src/services/helper/TodoRequestService';

{
    provide(TYPES.loggerService, () => new LoggerService());
    provide(TYPES.appwriteService, () => new AppwriteService());
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
