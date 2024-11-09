import { createLogger } from 'pinolog';

export class LoggerService {

    private _logger = createLogger("remote-grpc.log");

    public log = (...args: any[]) => {
        this._logger.log(...args);
    }

    public setPrefix = (prefix: string) => {
        this._logger = createLogger(`remote-grpc_${prefix}.log`);
    }

}

export default LoggerService
