import TYPES from "src/config/types";
import { inject } from "../../core/di";

import type ProtoService from "../base/ProtoService";
import type LoggerService from "../base/LoggerService";
import { lazy } from "di-lazy";
import { CC_GRPC_MAP } from "src/config/params";

export const BazClientService = lazy(
  class implements GRPC.IBazService {
    readonly protoService = inject<ProtoService>(TYPES.protoService);
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    _bazClient: GRPC.IBazService = null as never;


    constructor() {
        
        console.log("!!!BAZ");
        debugger
    }


    Execute = async (...args: any) => {
      this.loggerService.log("remote-grpc bazClientService Execute", { args });
      return await this._bazClient.Execute(...args);
    };

    init = () => {
      this._bazClient =
        this.protoService.makeClient<GRPC.IBazService>("BazService");
    };
  },
  ...CC_GRPC_MAP["BazService"].methodList
);

export type TBazClientService = InstanceType<typeof BazClientService>;

export default BazClientService;
