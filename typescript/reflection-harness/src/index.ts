import { Evaluator } from "./evaluator.js";
import { ReflectionHarness } from "./harness.js";
import { MockLLM } from "./mock-llm.js";

const task = "登录接口失败时，页面必须显示「登录失败，请重试」。";

const harness = new ReflectionHarness(
  new MockLLM(),
  new Evaluator(),
  { maxAttempts: 3 },
);

const success = await harness.run(task);
if (!success) {
  process.exitCode = 1;
}
