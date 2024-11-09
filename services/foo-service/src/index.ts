import { grpc } from "@modules/remote-grpc";

grpc.protoService.makeServer("FooService", {
    Execute: (request: any) => {
        if (request.data !== "foo") {
            throw new Error("data !== foo")
        }
        return { data: "ok" }
    }
});
