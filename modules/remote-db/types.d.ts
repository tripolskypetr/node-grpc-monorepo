import { Client, Storage, Databases, Models } from 'node-appwrite';
import * as functools_kit from 'functools-kit';
import * as di_scoped from 'di-scoped';

declare class LoggerService {
    private _logger;
    log: (...args: any[]) => void;
    setPrefix: (prefix: string) => void;
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

declare class ErrorService {
    handleGlobalError: (error: Error) => never;
    private _listenForError;
    protected init: () => void;
}

declare const ScopedService: (new () => {
    jwt: string;
    setJwt: (jwt: string) => void;
    getJwt: () => string;
}) & Omit<{
    new (jwt: string): {
        jwt: string;
        setJwt: (jwt: string) => void;
        getJwt: () => string;
    };
}, "prototype"> & di_scoped.IScopedClassRun<[jwt: string]>;

declare class MockApiService {
    readonly scopedService: {
        jwt: string;
        setJwt: (jwt: string) => void;
        getJwt: () => string;
    };
    fetchDataSample: () => {
        Authentication: string;
    };
}

declare const db: {
    scopedService: {
        jwt: string;
        setJwt: (jwt: string) => void;
        getJwt: () => string;
    };
    mockApiService: MockApiService;
    todoRequestService: TodoRequestService;
    todoDbService: TodoDbService;
    todoViewService: TodoViewService;
    loggerService: LoggerService;
    appwriteService: AppwriteService;
    errorService: ErrorService;
};

export { ScopedService, db };
