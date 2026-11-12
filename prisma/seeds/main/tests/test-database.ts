import "dotenv/config";

import { execFileSync } from "node:child_process";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

export const BACKEND_ROOT = path.resolve(__dirname, "../../../..");

const PRISMA_CLI = path.join(BACKEND_ROOT, "node_modules/prisma/build/index.js");

export interface TestDatabase {
  url: string;
  prisma: PrismaClient;
  drop(): Promise<void>;
}

export async function createTestDatabase(): Promise<TestDatabase> {
  const serverUrl = process.env.DATABASE_URL;

  if (!serverUrl) {
    throw new Error("Defina DATABASE_URL: o teste cria um banco temporário nesse servidor.");
  }

  const name = `seed_main_test_${Date.now()}`;
  const url = new URL(serverUrl);
  url.pathname = `/${name}`;

  const server = new PrismaClient({ datasourceUrl: serverUrl });
  await server.$executeRawUnsafe(`CREATE DATABASE "${name}"`);

  const prisma = new PrismaClient({ datasourceUrl: url.toString() });
  const drop = async (): Promise<void> => {
    await prisma.$disconnect();
    await server.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await server.$disconnect();
  };

  try {
    execFileSync(process.execPath, [PRISMA_CLI, "migrate", "deploy"], {
      cwd: BACKEND_ROOT,
      env: { ...process.env, DATABASE_URL: url.toString() },
      stdio: "pipe",
    });
  } catch (error) {
    await drop();
    throw error;
  }

  return { url: url.toString(), prisma, drop };
}
