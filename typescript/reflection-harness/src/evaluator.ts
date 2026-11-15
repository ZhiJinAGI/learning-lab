import type { Candidate, Evaluation } from "./types.js";

/** 通过实际执行候选实现来验证行为，而不是相信模型的自我判断。 */
export class Evaluator {
  async evaluate(candidate: Candidate): Promise<Evaluation> {
    const visibleMessages: string[] = [];

    const failingLogin = async (): Promise<void> => {
      throw new Error("HTTP 401");
    };

    await candidate.handleLogin(failingLogin, (message) => {
      visibleMessages.push(message);
    });

    const expected = ["登录失败，请重试"];
    const passed =
      visibleMessages.length === expected.length &&
      visibleMessages[0] === expected[0];

    if (passed) {
      return {
        passed: true,
        feedback: "通过：登录失败时，用户看到了错误提示。",
      };
    }

    return {
      passed: false,
      feedback:
        "失败：模拟接口返回 HTTP 401，但用户没有收到预期提示。" +
        ` 实际提示：${JSON.stringify(visibleMessages)}`,
    };
  }
}
