import { Prisma, PrismaClient } from "@prisma/client";

const commercialTrips: Prisma.CommercialTripCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    performedActionDescription: "Ação realizada na visita comercial 1",
    followUpDetails: "Detalhes de acompanhamento da visita comercial 1",
    pendingIssuesDescription: "Descrição de pendências da visita comercial 1",
    status: "PENDING",
    tripDate: new Date("2026-10-28"),
    expectedDate: new Date("2026-10-28"),
    producerId: "00000000-0000-4000-a000-000000000001",
    responsibleId: "00000000-0000-4000-a000-000000000001",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    performedActionDescription: "Ação realizada na visita comercial 2",
    followUpDetails: "Detalhes de acompanhamento da visita comercial 2",
    pendingIssuesDescription: "Sem pendências na visita comercial 2",
    status: "COMPLETED",
    tripDate: new Date("2026-10-28"),
    expectedDate: new Date("2026-10-28"),
    producerId: "00000000-0000-4000-a000-000000000002",
    responsibleId: "00000000-0000-4000-a000-000000000002",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    performedActionDescription: "Ação a realizar na visita comercial 3",
    status: "IN_PROGRESS",
    expectedDate: new Date("2026-10-28"),
    producerId: "00000000-0000-4000-a000-000000000001",
    responsibleId: "00000000-0000-4000-a000-000000000001",
    companyId: "00000000-0000-4000-a000-000000000001",
    deletedAt: new Date(),
  },
];

export async function seedCommercialTrips(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.commercialTrip.createMany({
    data: commercialTrips,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Visitas comerciais: ${count} criado(s), ${commercialTrips.length - count} já existia(m).`,
  );
}
