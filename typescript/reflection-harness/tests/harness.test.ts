import test from "node:test";
import assert from "node:assert/strict";
import { Evaluator } from "../src/evaluator.js";
import { ReflectionHarness } from "../src/harness.js";
import { MockLLM } from "../src/mock-llm.js";

test("第一轮失败后，Reflection 记忆帮助第二轮通过", async () => {
  const harness = new ReflectionHarness(
    new MockLLM(),
    new Evaluator(),
    { maxAttempts: 3 },
  );

  const success = await harness.run("登录失败时显示错误提示");

  assert.equal(success, true);
  assert.equal(harness.memory.size, 1);
});

test("达到最大尝试次数后停止", async () => {
  const alwaysFailingModel = {
    async generate() {
      return {
        source: "always failing candidate",
        handleLogin: async () => {
          // 故意不显示任何提示。
        },
      };
    },
    async reflect() {
      return "仍需处理登录失败提示";
    },
  };

  const harness = new ReflectionHarness(
    alwaysFailingModel,
    new Evaluator(),
    { maxAttempts: 2 },
  );

  const success = await harness.run("登录失败时显示错误提示");

  assert.equal(success, false);
  assert.equal(harness.memory.size, 1);
});
