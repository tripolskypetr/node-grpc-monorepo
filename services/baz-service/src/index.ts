import { grpc } from "@modules/remote-grpc";

export class BazService {
    Execute = (request: any) => {
        if (request.data !== "baz") {
            throw new Error("data !== baz")
        }
        return { data: "ok" }
    }
}

grpc.protoService.makeServer("BazService", new BazService);

