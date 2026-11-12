export class SeedError extends Error {}

export function throwIfProblems(title: string, problems: string[]): void {
  if (problems.length > 0) {
    throw new SeedError([title, ...problems.map((problem) => `- ${problem}`)].join("\n"));
  }
}
