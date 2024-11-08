import TYPES from "src/config/types";
import { inject } from "../../core/di";

import type ProtoService from "../base/ProtoService";
import type LoggerService from "../base/LoggerService";

export class FooClientService implements GRPC.IFooService {

    private readonly protoService = inject<ProtoService>(TYPES.protoService);
    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private _fooClient: GRPC.IFooService = null as never;

    Execute = async (...args: any) => {
        this.loggerService.log("remote-grpc fooClientService Execute", { args });
        return await this._fooClient.Execute(...args);
    };

    protected init = () => {
        this._fooClient = this.protoService.makeClient<GRPC.IFooService>("FooService")
    }

}

export default FooClientService;
