import { Client, Storage, Databases, Models } from 'node-appwrite';
import * as functools_kit from 'functools-kit';

declare class LoggerService {
    log: (...args: any[]) => void;
}

declare class AppwriteService {
    client: Client;
    storage: Storage;
    databases: Databases;
    createId: () => string;
    upsertDocument: (COLLECTION_ID: string, id: string, body: object) => Promise<any>;
    constructor();
    setDatabases: <T = Databases>(databases: T) => Databases;
    setStorage: <T = Storage>(storage: T) => Storage;
    private init;
    uploadFile: (file: File) => Promise<string>;
    uploadBlob: (blob: Blob, name: string) => Promise<string>;
    removeFile: (storagePath: string) => Promise<void>;
    getFileURL: (storagePath: string) => Promise<string>;
    getDownloadURL: (storagePath: string) => Promise<string>;
    getFileSize: (storagePath: string) => Promise<number>;
}

interface ITodoDto {
    title: string;
    completed: boolean;
}
interface ITodoDocument extends Models.Document, ITodoDto {
}
interface ITodoRow extends ITodoDocument {
    id: string;
}

declare class TodoViewService {
    private readonly todoDbService;
    private readonly loggerService;
    create: (dto: ITodoDto) => Promise<any>;
    update: (id: string, dto: Partial<ITodoDto>) => Promise<any>;
    read: (id: string) => Promise<any>;
    list: () => Promise<any[]>;
    remove: (id: string) => Promise<void>;
}

declare class TodoDbService {
    private readonly appwriteService;
    findAll: () => Promise<ITodoRow[]>;
    findById: (id: string) => Promise<ITodoDocument>;
    create: (dto: ITodoDto) => Promise<ITodoDocument>;
    update: (id: string, dto: Partial<ITodoDto>) => Promise<ITodoDocument>;
    remove: (id: string) => Promise<{}>;
}

declare class TodoRequestService {
    private readonly loggerService;
    getTodoCount: (() => Promise<number>) & functools_kit.IClearableTtl<string> & functools_kit.IControlMemoize<string, Promise<number>>;
}

declare const db: {
    todoRequestService: TodoRequestService;
    todoDbService: TodoDbService;
    todoViewService: TodoViewService;
    loggerService: LoggerService;
    appwriteService: AppwriteService;
};

export { db };
