import { Prisma, PrismaClient } from "@prisma/client";

const harvests: Prisma.HarvestCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Milho",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "Soja",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Trigo (excluída)",
    deletedAt: new Date(),
  },
];

export async function seedHarvests(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.harvest.createMany({
    data: harvests,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Colheitas: ${count} criado(s), ${harvests.length - count} já existia(m).`,
  );
}
