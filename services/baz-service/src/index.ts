import { grpc } from "@modules/remote-grpc";

grpc.protoService.makeServer("BazService", {
    Execute: (request: any) => {
        if (request.data !== "baz") {
            throw new Error("data !== baz")
        }
        return { data: "ok" }
    }
});
