import { scoped } from 'di-scoped';

export const ScopedService = scoped(class  {

    public jwt: string

    constructor(jwt: string) {
        this.jwt = jwt;
    }

    setJwt = (jwt: string) => {
        this.jwt = jwt;
    }

    getJwt = () => {
        return this.jwt;
    };

});

export type TScopedService = InstanceType<typeof ScopedService>;

export default ScopedService;
