import TYPES from "src/config/types";
import { inject } from "../../core/di";

import type ProtoService from "../base/ProtoService";
import type LoggerService from "../base/LoggerService";

export class BarClientService implements GRPC.IBarService {

    private readonly protoService = inject<ProtoService>(TYPES.protoService);
    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private _barClient: GRPC.IBarService = null as never;

    Execute = async (...args: any) => {
        this.loggerService.log("remote-grpc barClientService Execute", { args });
        return await this._barClient.Execute(...args);
    };

    protected init = () => {
        this._barClient = this.protoService.makeClient<GRPC.IBarService>("BarService")
    }

}

export default BarClientService;
