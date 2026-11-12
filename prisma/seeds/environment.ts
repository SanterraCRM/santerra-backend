import { execSync } from "node:child_process";

const PROTECTED_ENVIRONMENTS = ["main", "production"];

function getCurrentGitBranch(): string | undefined {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return undefined;
  }
}

export function getProtectedEnvironmentReason(): string | null {
  const signals = {
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    "branch git": getCurrentGitBranch(),
  };

  for (const [source, value] of Object.entries(signals)) {
    if (value && PROTECTED_ENVIRONMENTS.includes(value.trim().toLowerCase())) {
      return `${source}=${value}`;
    }
  }

  return null;
}
