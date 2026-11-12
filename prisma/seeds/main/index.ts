import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { readOptions } from "./options";
import { describeError, print } from "./output";
import { runMainSeed } from "./seed";

async function main(): Promise<void> {
  const options = readOptions(process.argv.slice(2), process.env);
  const prisma = new PrismaClient({ errorFormat: "minimal" });

  if (options.dryRun) {
    print(console.log, "Simulação (--dry-run): tudo roda numa transação desfeita no final.");
  }

  try {
    const report = await runMainSeed(prisma, options);
    const conclusion = options.dryRun ? "Simulação concluída: nada foi gravado." : "Concluído.";

    print(console.log, [...report, conclusion].join("\n"));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  print(console.error, `${describeError(error, process.env.SEED_ADMIN_PASSWORD)}\nNada foi gravado.`);
  process.exitCode = 1;
});
