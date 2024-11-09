import { grpc } from "@modules/remote-grpc";

import test from "tape";

test('Except bazClientService will return output', async (t) => {
  const output = await grpc.bazClientService.Execute({ data: "baz" });
  t.strictEqual(output.data, "ok");
})

test('Except bazClientService will reject when argument is not foo', async (t) => {
  try {
    await grpc.bazClientService.Execute({ data: "bar" });
    t.fail();
  } catch {
    t.pass();
  }
});
