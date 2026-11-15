# Reflection Harness

通过一个可运行的小例子，理解 Agent 如何从失败中总结经验，并在下一轮执行时使用经验。

## 场景

用户要求：登录接口失败时，页面必须显示「登录失败，请重试」。

第一轮 Agent 只把异常打印到控制台。Evaluator 运行行为测试后发现用户没有看到提示。Reflection 根据任务、候选代码和测试反馈总结失败原因，将经验写入 Memory。第二轮 Agent 读取经验并生成修复版本，测试通过。

## 流程

```text
Task
  |
  v
LLM.generate(task, memory)
  |
  v
Evaluator.evaluate(candidate)
  |
  +---- PASS ----> Finish
  |
  +---- FAIL
          |
          v
      LLM.reflect(task, candidate, feedback)
          |
          v
      Memory.append(reflection)
          |
          v
      Next attempt (memory is included)
```

## 运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run demo
npm test
```

## 代码结构

- `src/types.ts`：候选实现、评估结果等类型。
- `src/mock-llm.ts`：模拟模型生成和反思。为了无需 API Key，模型行为是确定性的。
- `src/evaluator.ts`：执行行为测试，验证用户是否真的看到错误提示。
- `src/memory.ts`：保存反思经验。
- `src/harness.ts`：组织生成、评估、反思、记忆和重试。
- `src/index.ts`：运行入口。
- `tests/harness.test.ts`：验证第一轮失败、第二轮成功。

## 重要理解

这个练习真实实现了 Harness 的调度、评估、反思结果保存和重试流程，但没有连接真实大模型。LLM 部分由 `MockLLM` 模拟。

Reflection 不会自动修改模型权重。这里的经验保存在内存中，并在下一轮作为上下文传给模型。程序退出后记忆会丢失。

## 可以继续扩展

1. 把 MockLLM 替换为真实模型 API 或 Codex CLI。
2. 将 Memory 改为 JSON 文件或 SQLite 持久化。
3. 增加最大重试次数、超时和成本限制。
4. 增加不同失败类型的评估器。
5. 记录每一轮的完整执行轨迹。
