import TYPES from "src/config/types";
import { inject } from "../../core/di";

import type ProtoService from "../base/ProtoService";
import type LoggerService from "../base/LoggerService";

export class BazClientService implements GRPC.IBazService {

    private readonly protoService = inject<ProtoService>(TYPES.protoService);
    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private _bazClient: GRPC.IBazService = null as never;

    Execute = async (...args: any) => {
        this.loggerService.log("remote-grpc bazClientService Execute", { args });
        return await this._bazClient.Execute(...args);
    };

    protected init = () => {
        this._bazClient = this.protoService.makeClient<GRPC.IBazService>("BazService")
    }

}

export default BazClientService;
