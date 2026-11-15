import type { Evaluation, LanguageModel } from "./types.js";
import { Evaluator } from "./evaluator.js";
import { Memory } from "./memory.js";

export interface HarnessOptions {
  maxAttempts?: number;
}

export class ReflectionHarness {
  private readonly maxAttempts: number;
  readonly memory = new Memory();

  constructor(
    private readonly llm: LanguageModel,
    private readonly evaluator: Evaluator,
    options: HarnessOptions = {},
  ) {
    this.maxAttempts = options.maxAttempts ?? 3;
    if (this.maxAttempts < 1) {
      throw new Error("maxAttempts 必须至少为 1");
    }
  }

  async run(task: string): Promise<boolean> {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      console.log(`\n========== 第 ${attempt} 轮 ==========`);

      const candidate = await this.llm.generate(task, this.memory.getAll());
      console.log("\n[候选代码]\n" + candidate.source);

      const evaluation: Evaluation = await this.evaluator.evaluate(candidate);
      console.log(
        `[Evaluator] ${evaluation.passed ? "PASS" : "FAIL"}: ${evaluation.feedback}`,
      );

      if (evaluation.passed) {
        console.log("\n[Harness] 任务完成，停止迭代。");
        return true;
      }

      if (attempt < this.maxAttempts) {
        const reflection = await this.llm.reflect(task, candidate, evaluation);
        this.memory.append(reflection);
        console.log("[Harness] 反思经验已写入 Memory。");
      }
    }

    console.log("\n[Harness] 达到最大尝试次数，停止执行。");
    return false;
  }
}
