import "dotenv/config";
import "reflect-metadata";

import { app } from "./app";
import { prisma } from "./shared/infrastructure/database/prisma-client";

const port = Number(process.env.PORT ?? 7777);

const server = app.listen(port, () => {
  console.log(`Servidor HTTP executando na porta ${port}.`);
});

async function shutdown(): Promise<void> {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
