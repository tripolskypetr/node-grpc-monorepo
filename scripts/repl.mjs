import { grpc } from "@modules/remote-grpc";
import { ScopedService, db } from "@modules/remote-db";

{
  globalThis.grpc = grpc;
  globalThis.db = db;
  globalThis.ScopedService = ScopedService;
}
