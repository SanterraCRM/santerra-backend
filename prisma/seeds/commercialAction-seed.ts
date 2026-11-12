import { Prisma, PrismaClient } from "@prisma/client";

const commercialAction: Prisma.CommercialActionCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    description: "Dia de campo",
    eventId: "00000000-0000-4000-a000-000000000001",
    price: 1000.0,
    initialDate: new Date("2026-10-30"),
    finalDate: new Date("2026-10-30"),
    walletId: "00000000-0000-4000-a000-000000000001",
    responsibleId: "00000000-0000-4000-a000-000000000001",
    companyId: "00000000-0000-4000-a000-000000000001",
    invoiceNumber: "INV-001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    description: "Churrasco com clientes",
    eventId: "00000000-0000-4000-a000-000000000002",
    price: 500.0,
    initialDate: new Date("2026-10-25"),
    finalDate: new Date("2026-10-25"),
    walletId: "00000000-0000-4000-a000-000000000002",
    responsibleId: "00000000-0000-4000-a000-000000000002",
    companyId: "00000000-0000-4000-a000-000000000001",
    invoiceNumber: "INV-002",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    description: "Reunião de negócios",
    eventId: "00000000-0000-4000-a000-000000000003",
    price: 200.0,
    initialDate: new Date("2026-10-20"),
    finalDate: new Date("2026-10-20"),
    walletId: "00000000-0000-4000-a000-000000000003",
    responsibleId: "00000000-0000-4000-a000-000000000003",
    companyId: "00000000-0000-4000-a000-000000000002",
    invoiceNumber: "INV-003",
    deletedAt: new Date(),
  },
];

export async function seedCommercialAction(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.commercialAction.createMany({
    data: commercialAction,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Visitas comerciais: ${count} criado(s), ${commercialAction.length - count} já existia(m).`,
  );
}
