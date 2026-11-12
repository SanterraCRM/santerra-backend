import { PrismaClient } from "@prisma/client";

import { seedAdmin } from "./admin-seed";
import { seedCompany } from "./company-seed";
import { SeedOptions } from "./options";
import { ADMINISTRATOR_ROLE } from "./roles";
import { seedRoles } from "./roles-seed";
import { verifySeed } from "./verify-seed";

const LOCK_KEY = "seed:main";
const TRANSACTION_TIMEOUT_MS = 60_000;

class DryRunRollback extends Error {}

export async function runMainSeed(
  prisma: PrismaClient,
  { dryRun, adminPassword }: SeedOptions,
): Promise<string[]> {
  const report: string[] = [];

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${LOCK_KEY}))`;

        const companyId = await seedCompany(tx, report);
        const roleIds = await seedRoles(tx, companyId, report);

        await seedAdmin(
          tx,
          {
            companyId,
            administratorRoleId: roleIds[ADMINISTRATOR_ROLE],
            password: adminPassword,
          },
          report,
        );
        await verifySeed(tx, companyId);

        if (dryRun) {
          throw new DryRunRollback();
        }
      },
      { timeout: TRANSACTION_TIMEOUT_MS },
    );
  } catch (error) {
    if (!(error instanceof DryRunRollback)) {
      throw error;
    }
  }

  return report;
}
