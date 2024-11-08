import { grpc } from "@modules/remote-grpc";

grpc.protoService.makeServer("BarService", {
    Execute: (request: any) => {
        console.log("bar-service", { request })
        return request
    }
});
