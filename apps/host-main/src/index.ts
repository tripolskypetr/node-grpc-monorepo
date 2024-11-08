import { grpc } from "@modules/remote-grpc";
import micro from "micro";
import http from "http";

import serveHandler from "serve-handler";

const server = new http.Server(
  micro.serve(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");

    if (req.url?.startsWith("/api/v1/foo")) {
        const output = await grpc.fooClientService.Execute({ data: "foo" });
        return micro.send(res, 200, output);
    }

    return serveHandler(req, res, {
        public: './public',
    });
  })
);

server.listen(50050);
