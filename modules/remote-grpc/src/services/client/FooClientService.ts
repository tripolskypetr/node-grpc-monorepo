import TYPES from "src/config/types";
import { inject } from "../../core/di";

import type ProtoService from "../base/ProtoService";
import type LoggerService from "../base/LoggerService";
import { lazy } from "di-lazy";
import { CC_GRPC_MAP } from "src/config/params";

export const FooClientService = lazy(
  class implements GRPC.IFooService {
    readonly protoService = inject<ProtoService>(TYPES.protoService);
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    _fooClient: GRPC.IFooService = null as never;

    constructor() {
      console.log("!!!FOO");
      debugger;
    }

    Execute = async (...args: any) => {
      this.loggerService.log("remote-grpc fooClientService Execute", { args });
      return await this._fooClient.Execute(...args);
    };

    init = () => {
      this._fooClient =
        this.protoService.makeClient<GRPC.IFooService>("FooService");
    };
  },
  ...CC_GRPC_MAP["FooService"].methodList
);

export type TFooClientService = InstanceType<typeof FooClientService>;

export default FooClientService;
