import { grpc } from "@modules/remote-grpc";

export class FooService {
    Execute = (request: any) => {
        if (request.data !== "foo") {
            throw new Error("data !== foo")
        }
        return { data: "ok" }
    }
}

grpc.loggerService.setPrefix("foo-service");
grpc.protoService.makeServer("FooService", new FooService);
