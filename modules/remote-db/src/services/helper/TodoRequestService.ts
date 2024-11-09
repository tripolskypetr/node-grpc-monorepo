import { inject } from "../../core/di";
import TYPES from "../../config/types";
import { resolveDocuments, ttl } from "functools-kit";
import listDocuments from "../../utils/listDocuments";
import { CC_APPWRITE_TODO_COLLECTION_ID } from "../../config/params";
import { Query } from "node-appwrite";
import type LoggerService from "../base/LoggerService";

export class TodoRequestService {
    
    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    getTodoCount = ttl(async () => {
        this.loggerService.log("remote-db todoRequestService getTodoCount");
        const rows = await resolveDocuments(listDocuments(CC_APPWRITE_TODO_COLLECTION_ID, [
            Query.select(["$id"]),
        ]));
        return rows.length
    });

}

export default TodoRequestService;
