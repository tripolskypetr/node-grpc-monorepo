import { grpc } from "@modules/remote-grpc";

import test from "tape";

test('Except barClientService will return output', async (t) => {
  const output = await grpc.barClientService.Execute({ data: "bar" });
  t.strictEqual(output.data, "ok");
})

test('Except barClientService will reject when argument is not foo', async (t) => {
  try {
    await grpc.barClientService.Execute({ data: "foo" });
    t.fail();
  } catch {
    t.pass();
  }
});
