import type { Candidate, Evaluation, LanguageModel } from "./types.js";

/**
 * 确定性假模型：无需 API Key 即可观察 Reflection 流程。
 * 第一次生成有缺陷的实现，读取反思记忆后生成修复实现。
 */
export class MockLLM implements LanguageModel {
  async generate(task: string, memories: readonly string[]): Promise<Candidate> {
    console.log("\n[LLM] 收到任务：", task);

    if (memories.length > 0) {
      console.log("[LLM] 读取历史反思：", memories.at(-1));
      return {
        source: `async function handleLogin(login, showToast) {
  try {
    await login();
  } catch {
    showToast("登录失败，请重试");
  }
}`,
        handleLogin: async (login, showToast) => {
          try {
            await login();
          } catch {
            showToast("登录失败，请重试");
          }
        },
      };
    }

    console.log("[LLM] 没有历史经验，生成初始实现。");
    return {
      source: `async function handleLogin(login, showToast) {
  try {
    await login();
  } catch (error) {
    console.error(error);
  }
}`,
      handleLogin: async (login) => {
        try {
          await login();
        } catch (error) {
          console.error(error);
        }
      },
    };
  }

  async reflect(
    _task: string,
    _candidate: Candidate,
    evaluation: Evaluation,
  ): Promise<string> {
    console.log("\n[Reflection LLM] 分析失败轨迹……");
    console.log("[Reflection LLM] 评估反馈：", evaluation.feedback);

    return [
      "失败原因：异常分支只执行了 console.error，没有向用户展示提示。",
      "下一轮要求：登录失败时调用 showToast('登录失败，请重试')。",
      "修改后必须重新运行失败测试。",
    ].join("\n");
  }
}
