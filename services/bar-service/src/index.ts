import { grpc } from "@modules/remote-grpc";

export class BarService {
    Execute = (request: any) => {
        if (request.data !== "bar") {
            throw new Error("data !== bar")
        }
        return { data: "ok" }
    }
}

grpc.loggerService.setPrefix("bar-service");
grpc.protoService.makeServer<BarService>("BarService", new BarService);

