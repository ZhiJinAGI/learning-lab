/** 最小内存记忆实现：只在当前进程生命周期内保存反思经验。 */
export class Memory {
  private readonly entries: string[] = [];

  append(entry: string): void {
    this.entries.push(entry);
  }

  getAll(): readonly string[] {
    return [...this.entries];
  }

  get size(): number {
    return this.entries.length;
  }
}
