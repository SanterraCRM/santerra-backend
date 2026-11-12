import { SeedError } from "./seed-error";

const ARGON2_HASH = /\$argon2[^\s"'`]*/g;

export function print(log: (line: string) => void, text: string): void {
  for (const line of text.split("\n")) {
    log(`[seed:main] ${line}`);
  }
}

export function describeError(error: unknown, password?: string): string {
  if (error instanceof SeedError) {
    return error.message;
  }

  const message = (error instanceof Error ? error.message : String(error))
    .trim()
    .replace(ARGON2_HASH, "[hash omitido]");

  return `Erro inesperado: ${password ? message.split(password).join("[senha omitida]") : message}`;
}
