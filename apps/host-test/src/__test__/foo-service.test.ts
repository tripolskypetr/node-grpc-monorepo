import { grpc } from "@modules/remote-grpc";

import test from "tape";

test('Except fooClientService will return output', async (t) => {
  const output = await grpc.fooClientService.Execute({ data: "foo" });
  t.strictEqual(output.data, "ok");
})

test('Except fooClientService will reject when argument is not foo', async (t) => {
  try {
    await grpc.fooClientService.Execute({ data: "bar" });
    t.fail();
  } catch {
    t.pass();
  }
});
