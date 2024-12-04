import TYPES from "src/config/types";
import { inject } from "../../core/di";

import type ProtoService from "../base/ProtoService";
import type LoggerService from "../base/LoggerService";
import { lazy } from "di-lazy";
import { CC_GRPC_MAP } from "src/config/params";

export const BarClientService = lazy(
  class implements GRPC.IBarService {
    readonly protoService = inject<ProtoService>(TYPES.protoService);
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    _barClient: GRPC.IBarService = null as never;

    constructor() {
        console.log("!!!BAR");
        debugger
    }

    Execute = async (...args: any) => {
      this.loggerService.log("remote-grpc barClientService Execute", { args });
      return await this._barClient.Execute(...args);
    };

    init = () => {
      this._barClient =
        this.protoService.makeClient<GRPC.IBarService>("BarService");
    };
  },
  ...CC_GRPC_MAP["BarService"].methodList
);

export type TBarClientService = InstanceType<typeof BarClientService>;

export default BarClientService;
