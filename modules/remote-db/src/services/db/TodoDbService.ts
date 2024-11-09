import { inject } from "../../core/di";

import { 
    CC_APPWRITE_TODO_COLLECTION_ID,
    CC_APPWRITE_DATABASE_ID,
} from "../../config/params";

import TYPES from "../../config/types";
import type AppwriteService from "../base/AppwriteService";
import { resolveDocuments } from 'functools-kit';
import listDocuments from '../../utils/listDocuments';

import { ITodoDocument, ITodoDto, ITodoRow } from '../../model/Todo.model';

export class TodoDbService {

    private readonly appwriteService = inject<AppwriteService>(TYPES.appwriteService);

    findAll = async () => {
        return await resolveDocuments<ITodoRow>(listDocuments(CC_APPWRITE_TODO_COLLECTION_ID));
    };

    findById = async (id: string) => {
        return await this.appwriteService.databases.getDocument<ITodoDocument>(
            CC_APPWRITE_DATABASE_ID,
            CC_APPWRITE_TODO_COLLECTION_ID,
            id,
        );
    };

    create = async (dto: ITodoDto) => {
        return await this.appwriteService.databases.createDocument<ITodoDocument>(
            CC_APPWRITE_DATABASE_ID,
            CC_APPWRITE_TODO_COLLECTION_ID,
            this.appwriteService.createId(),
            dto,
        );
    };

    update = async (id: string, dto: Partial<ITodoDto>) => {
        return await this.appwriteService.databases.updateDocument<ITodoDocument>(
            CC_APPWRITE_DATABASE_ID,
            CC_APPWRITE_TODO_COLLECTION_ID,
            id,
            dto,
        );
    };

    remove = async (id: string) => {
        return await this.appwriteService.databases.deleteDocument(
            CC_APPWRITE_DATABASE_ID,
            CC_APPWRITE_TODO_COLLECTION_ID,
            id,
        );
    };

};

export default TodoDbService;
