import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { seedCompanies } from "./companies-seed";
import { seedEvents } from "./events-seed";
import { seedPersons } from "./persons-seed";
import { seedUsers } from "./users-seed";
import { seedManufacturers } from "./manufacturers-seed";
import { seedProducts } from "./products-seed";
import { seedHarvests } from "./harvest-seed";
import { seedRoles } from "./roles-seed";
import { seedResellers } from "./resellers-seed";
import { seedPotentials } from "./potential-seed";
import { seedProducers } from "./producers-seed";
import { seedMembers } from "./members-seed";
import { seedWallets } from "./wallets-seed";
import { seedEmployees } from "./employee-seed";
import { seedCommercialTrips } from "./commercialTrip-seed";
import { seedCommercialAction } from "./commercialAction-seed";
import { seedGroups } from "./groups-seed";
import { seedGoals } from "./goals-seed";

import { getProtectedEnvironmentReason } from "./environment";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const protectedReason = getProtectedEnvironmentReason();

  if (protectedReason) {
    console.warn(
      `[seed] Ambiente da main (${protectedReason}): seeds de desenvolvimento ignorados.`,
    );
    return;
  }
  await seedCompanies(prisma);
  await seedUsers(prisma);
  await seedPersons(prisma);
  await seedManufacturers(prisma);
  await seedProducts(prisma);
  await seedHarvests(prisma);
  await seedRoles(prisma);
  await seedResellers(prisma);
  await seedPotentials(prisma);
  await seedProducers(prisma);
  await seedMembers(prisma);
  await seedWallets(prisma);
  await seedEmployees(prisma);
  await seedEvents(prisma);
  await seedCommercialTrips(prisma);
  await seedCommercialAction(prisma);
  await seedGroups(prisma);
  await seedGoals(prisma);
}

main()
  .catch((error) => {
    console.error("[seed] Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
