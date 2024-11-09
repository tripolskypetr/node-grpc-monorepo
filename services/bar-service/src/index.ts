import { grpc } from "@modules/remote-grpc";

grpc.protoService.makeServer("BarService", {
    Execute: (request: any) => {
        if (request.data !== "bar") {
            throw new Error("data !== bar")
        }
        return { data: "ok" }
    }
});
