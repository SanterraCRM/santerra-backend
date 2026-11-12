import { Prisma, PrismaClient } from "@prisma/client";

const producers: Prisma.ProducerCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    personId: "00000000-0000-4000-a000-000000000002",
    potentialId: "00000000-0000-4000-a000-000000000001",
    address: "Estrada Municipal RV-10, km 12, Rio Verde - GO",
    mainCrop: "Soja",
    totalArea: 1250.5,
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    personId: "00000000-0000-4000-a000-000000000001",
    potentialId: "00000000-0000-4000-a000-000000000002",
    mainCrop: "Milho",
    totalArea: 320,
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    personId: "00000000-0000-4000-a000-000000000004",
    potentialId: "00000000-0000-4000-a000-000000000004",
    mainCrop: "Café",
    companyId: "00000000-0000-4000-a000-000000000002",
    deletedAt: new Date(),
  },
];

export async function seedProducers(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.producer.createMany({
    data: producers,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Produtores: ${count} criado(s), ${producers.length - count} já existia(m).`,
  );
}
