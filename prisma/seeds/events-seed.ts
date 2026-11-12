import { Prisma, PrismaClient } from "@prisma/client";

const events: Prisma.EventCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Dia de Campo Soja 2026",
    description: "Demonstração de cultivares e manejo para produtores da região.",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "Feira Agro Rio Verde",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Workshop de Irrigação",
    companyId: "00000000-0000-4000-a000-000000000002",
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    name: "Palestra de Pós-Colheita",
    description: "Evento com soft delete, não deve aparecer nas listagens.",
    companyId: "00000000-0000-4000-a000-000000000002",
    deletedAt: new Date(),
  },
];

export async function seedEvents(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.event.createMany({
    data: events,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Eventos: ${count} criado(s), ${events.length - count} já existia(m).`,
  );
}
