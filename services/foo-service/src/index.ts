import { grpc } from "@modules/remote-grpc";

grpc.protoService.makeServer("FooService", {
    Execute: (request: any) => {
        console.log("foo-service", { request })
        return request
    }
});
