import { grpc } from "@modules/remote-grpc";

grpc.protoService.makeServer("BazService", {
    Execute: (request: any) => {
        console.log("baz-service", { request })
        return request
    }
});
