import { Prisma, PrismaClient } from "@prisma/client";

const companies: Prisma.CompanyCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Santerra",
    description: "Empresa principal para desenvolvimento.",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "Agro Vale Verde",
    description: "Empresa fictícia para testar cenários com mais de uma empresa.",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Cerealista Horizonte (excluída)",
    description: "Empresa com soft delete, não deve aparecer nas listagens.",
    deletedAt: new Date(),
  },
];

export async function seedCompanies(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.company.createMany({
    data: companies,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Empresas: ${count} criada(s), ${companies.length - count} já existia(m).`,
  );
}
