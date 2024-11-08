import { join, resolve } from "path";

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

import { get } from "../../utils/get";

import { CC_GRPC_MAP, CC_GRPT_PROTO_PATH } from "../../config/params";

const readProto = (name: string) => {
  const absolutePath = resolve(join(CC_GRPT_PROTO_PATH, `${name}.proto`));
  console.log(`Loadig proto ${absolutePath}`);
  const packageDefinition = protoLoader.loadSync(
    absolutePath
  );
  return grpc.loadPackageDefinition(packageDefinition);
};

const promisifyMethod =
  <T = unknown>(grpcMethod: Function) =>
  (request: Record<string, unknown>) => {
    return new Promise((resolve, reject) => {
      grpcMethod(request, (error: Error, response: T) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  };

type Ctor = new (...args: any[]) => any;
type ServiceName = keyof typeof CC_GRPC_MAP;

interface IService {
  [key: string | number | symbol]: Function;
}

export class ProtoService {
  private readonly _protoMap = new Map<string, grpc.GrpcObject>();

  loadProto = (protoName: string) => {
    return this._protoMap.has(protoName)
      ? this._protoMap.get(protoName)!
      : this._protoMap.set(protoName, readProto(protoName)).get(protoName)!;
  };

  makeClient = <T = IService>(serviceName: ServiceName) => {
    const { grpcHost, protoName, methodList } = CC_GRPC_MAP[serviceName];
    const proto = this.loadProto(protoName);
    const Ctor = get(proto, serviceName) as unknown as Ctor;
    const barClient = new Ctor(grpcHost, grpc.credentials.createInsecure());
    return methodList.reduce<T>(
      (acm, cur) => ({
        ...acm,
        [cur]: promisifyMethod(get(barClient, cur).bind(barClient)),
      }),
      {} as unknown as T
    );
  };

  makeServer = <T extends IService = IService>(serviceName: ServiceName, connector: T) => {
    const { grpcHost, protoName, methodList } = CC_GRPC_MAP[serviceName];
    const proto = this.loadProto(protoName);

    const serviceInstance = methodList.reduce((acm, cur) => {
      const executor = get(connector, cur).bind(connector);
      return {
        ...acm,
        [cur]: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
          try {
            const result = await executor(call.request);
            callback(null, result || {});
          } catch (error) {
            callback(error as grpc.ServiceError, null);
          }
        },
      };
    }, {} as grpc.UntypedServiceImplementation);

    const server = new grpc.Server();
    server.addService(get(proto, `${serviceName}.service`) as unknown as grpc.ServiceDefinition, serviceInstance);
    server.bindAsync(grpcHost, grpc.ServerCredentials.createInsecure(), (error) => {
      if (error) {
        throw new Error(`Failed to serve ${serviceName}, host=${grpcHost}`)
      }
    });
  };
}

export default ProtoService;
