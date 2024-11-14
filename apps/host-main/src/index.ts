import { grpc } from "@modules/remote-grpc";
import { db, ScopedService } from "@modules/remote-db";
import micro from "micro";
import http from "http";
import Router from "router";
import finalhandler from "finalhandler";

import serveHandler from "serve-handler";

const router = Router();

router.get("/", (req, res) => {
  micro.send(res, 200, "Hello world111");
});

router.get("/api/v1/foo", async (req, res) => {
  const output = await grpc.fooClientService.Execute({ data: "foo" });
  return micro.send(res, 200, output);
});

router.get("/api/v1/bar", async (req, res) => {
  const output = await grpc.barClientService.Execute({ data: "bar" });
  return micro.send(res, 200, output);
});

router.get("/api/v1/baz", async (req, res) => {
  const output = await grpc.bazClientService.Execute({ data: "baz" });
  return micro.send(res, 200, output);
});

router.get("/api/v1/todo_count", async (req, res) => {
  const output = await db.todoRequestService.getTodoCount();
  return micro.send(res, 200, output);
});

router.get("/api/v1/jwt", async (req, res) => {
  const output = await ScopedService.runInContext(async () => {
    return await db.mockApiService.fetchDataSample();
  }, "example-jwt");
  return micro.send(res, 200, output);
});


router.get("/*", (req, res) => serveHandler(req, res, {
  public: "./public",
}));

const server = new http.Server(
  micro.serve(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");

    return router(
      req,
      res,
      finalhandler(req, res),
    );
  })
);

server.listen(50050);

grpc.loggerService.setPrefix("host-main");
db.loggerService.setPrefix("host-main");
