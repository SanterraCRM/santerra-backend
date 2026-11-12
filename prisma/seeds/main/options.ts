import { throwIfProblems } from "./seed-error";

const KNOWN_FLAGS = ["--dry-run", "--force"];
const BLOCKED_NODE_ENVS = ["development", "test"];
const MIN_PASSWORD_LENGTH = 12;

export interface SeedOptions {
  dryRun: boolean;
  adminPassword: string;
}

export function readOptions(args: string[], env: NodeJS.ProcessEnv): SeedOptions {
  const nodeEnv = env.NODE_ENV?.trim().toLowerCase() ?? "";
  const adminPassword = env.SEED_ADMIN_PASSWORD ?? "";
  const unknownFlags = args.filter((arg) => !KNOWN_FLAGS.includes(arg));
  const problems: string[] = [];

  if (unknownFlags.length > 0) {
    problems.push(
      `Opção desconhecida: ${unknownFlags.join(" ")}. As opções são ${KNOWN_FLAGS.join(" e ")}.`,
    );
  }

  if (BLOCKED_NODE_ENVS.includes(nodeEnv) && !args.includes("--force")) {
    problems.push(
      `NODE_ENV=${env.NODE_ENV}: a seed da main não roda em desenvolvimento nem em teste. Para rodar mesmo assim, passe --force.`,
    );
  }

  if (env.SEED_CONFIRM !== "main") {
    problems.push("Defina SEED_CONFIRM=main para confirmar a execução.");
  }

  if (!adminPassword) {
    problems.push(
      `Defina SEED_ADMIN_PASSWORD com a senha do admin (pelo menos ${MIN_PASSWORD_LENGTH} caracteres).`,
    );
  } else if (adminPassword.length < MIN_PASSWORD_LENGTH) {
    problems.push(`SEED_ADMIN_PASSWORD precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

  throwIfProblems("A seed da main não rodou:", problems);

  return { dryRun: args.includes("--dry-run"), adminPassword };
}
