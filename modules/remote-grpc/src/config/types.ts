const baseServices = {
    protoService: Symbol('protoService'),
    loggerService: Symbol('loggerService'),
    errorService: Symbol.for('errorService'),
    streamService: Symbol.for('streamService'),
};

const clientServices = {
    fooClientService: Symbol('fooClientService'),
    barClientService: Symbol('barClientService'),
    bazClientService: Symbol('bazClientService'),
}

export const TYPES = {
    ...baseServices,
    ...clientServices,
};

export default TYPES;
