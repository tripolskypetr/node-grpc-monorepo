import { grpc } from "@modules/remote-grpc";

grpc.fooClientService.Execute({ data: "hello world" }).catch(console.log)

setInterval(() => {}, 15_000);
