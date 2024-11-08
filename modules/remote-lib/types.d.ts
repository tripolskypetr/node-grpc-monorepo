declare class LoggerService {
    log: (...args: any[]) => void;
}

declare const lib: {
    loggerService: LoggerService;
};

export { lib };
