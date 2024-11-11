import { errorData } from 'functools-kit';
import fs from "fs";

const ERROR_HANDLER_INSTALLED = Symbol.for('error-handler-installed');

export class ErrorService {

    public handleGlobalError = (error: Error) => {
        fs.appendFileSync('./error.txt', JSON.stringify(errorData(error), null, 2));
        process.exit(-1);
    };

    private _listenForError = () => {
        console.log("Global exceptions listened in remote-db");
        process.on('uncaughtException', (err) => {
            console.log(err);
            this.handleGlobalError(err);
        });
        process.on('unhandledRejection', (error) => {
            throw error;
        });
    };

    protected init = () => {
        const global = <any>globalThis;
        if (global[ERROR_HANDLER_INSTALLED]) {
            return;
        }
        this._listenForError();
        global[ERROR_HANDLER_INSTALLED] = 1;
    }

}

export default ErrorService;
