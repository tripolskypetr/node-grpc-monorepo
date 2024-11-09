import { createLogger } from 'pinolog';

const logger = createLogger("remote-grpc.log");

export class LoggerService {

    public log = (...args: any[]) => {
        logger.log(...args);
    }

}

export default LoggerService
