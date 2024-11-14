import TYPES from "./config/types";
import "./config/provide";
import { inject, init } from "./core/di";
import type LoggerService from "./services/base/LoggerService";
import type AppwriteService from "./services/base/AppwriteService";
import TodoViewService from "./services/view/TodoViewService";
import TodoDbService from "./services/db/TodoDbService";
import TodoRequestService from "./services/helper/TodoRequestService";
import ErrorService from "./services/base/ErrorService";
import { ScopedService, TScopedService } from "./services/sample/ScopedService";
import MockApiService from "./services/sample/MockApiService";

const baseServices = {
    loggerService: inject<LoggerService>(TYPES.loggerService),
    appwriteService: inject<AppwriteService>(TYPES.appwriteService),
    errorService: inject<ErrorService>(TYPES.errorService),
};

const viewServices = {
    todoViewService: inject<TodoViewService>(TYPES.todoViewService),
};

const dbServices = {
    todoDbService: inject<TodoDbService>(TYPES.todoDbService),
};

const requestServices = {
    todoRequestService: inject<TodoRequestService>(TYPES.todoRequestService),
};

const sampleServices = {
    scopedService: inject<TScopedService>(TYPES.scopedService),
    mockApiService: inject<MockApiService>(TYPES.mockApiService),
}

init();

export const db = {
    ...baseServices,
    ...viewServices,
    ...dbServices,
    ...requestServices,
    ...sampleServices,
};

export {
    ScopedService,
};
