import { Prisma, PrismaClient } from "@prisma/client";

const potentials: Prisma.PotentialCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Alto",
    numericValue: 80,
    description: "Alto potencial de promoção.",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "Médio",
    numericValue: 50,
    description: "Médio potencial de promoção.",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    name: "Baixo (excluída)",
    numericValue: 10,
    description: "Potencial com soft delete, não deve aparecer nas listagens.",
    companyId: "00000000-0000-4000-a000-000000000002",
    deletedAt: new Date(),
  },
];

export async function seedPotentials(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.potential.createMany({
    data: potentials,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Potenciais: ${count} criado(s), ${potentials.length - count} já existia(m).`,
  );
}
