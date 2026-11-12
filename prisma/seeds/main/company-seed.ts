import { Prisma } from "@prisma/client";

import { SeedError } from "./seed-error";

export const SANTERRA: Prisma.CompanyCreateInput = {
  name: "Santerra",
  description: null,
};

export async function seedCompany(
  tx: Prisma.TransactionClient,
  report: string[],
): Promise<string> {
  const companies = await tx.company.findMany({
    where: { name: SANTERRA.name, deletedAt: null },
    select: { id: true },
    take: 2,
  });

  if (companies.length > 1) {
    throw new SeedError(
      `Há mais de uma empresa ativa com o nome "${SANTERRA.name}". Deixe só uma e rode de novo.`,
    );
  }

  const [existing] = companies;

  if (existing) {
    report.push(`Empresa "${SANTERRA.name}": já existia.`);
    return existing.id;
  }

  const company = await tx.company.create({ data: SANTERRA, select: { id: true } });
  report.push(`Empresa "${SANTERRA.name}": criada.`);

  return company.id;
}
