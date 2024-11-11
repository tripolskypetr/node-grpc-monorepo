import { db } from '@modules/remote-db';
import { grpc } from '@modules/remote-grpc';

import "./__test__/foo-service.test";
import "./__test__/bar-service.test";
import "./__test__/baz-service.test";

// import { db } from "@modules/remote-db";
// db.todoRequestService.getTodoCount().then(console.log);

db.loggerService.setPrefix("host-test");
grpc.loggerService.setPrefix("host-test");
