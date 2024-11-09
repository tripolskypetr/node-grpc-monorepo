import { inject } from "../../core/di";

import type TodoDbService from "../db/TodoDbService";
import type LoggerService from "../base/LoggerService";

import TYPES from "../../config/types";
import { listTransform, readTransform, writeTransform } from "../../utils/transform";
import { ITodoDto } from "../../model/Todo.model";

export class TodoViewService {

    private readonly todoDbService = inject<TodoDbService>(TYPES.todoDbService);
    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    create = async (dto: ITodoDto) => {
        this.loggerService.log('remote-db todoViewService create', { dto });
        const result = await this.todoDbService.create(writeTransform(dto));
        return readTransform(result);
    };

    update = async (id: string, dto: Partial<ITodoDto>) => {
        this.loggerService.log('remote-db todoViewService update', { dto });
        const result = await this.todoDbService.update(id, writeTransform(dto));
        return readTransform(result);
    };

    read = async (id: string) => {
        this.loggerService.log('remote-db todoViewService read', { id });
        const result = await this.todoDbService.findById(id);
        return readTransform(result);
    };

    list = async () => {
        this.loggerService.log('remote-db todoViewService list');
        const result = await this.todoDbService.findAll();
        return listTransform(result);
    };

    remove = async (id: string) => {
        this.loggerService.log('remote-db todoViewService remove', { id });
        await this.todoDbService.remove(id);
    };

};

export default TodoViewService;