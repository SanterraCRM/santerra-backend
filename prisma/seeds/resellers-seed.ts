import { Prisma, PrismaClient } from "@prisma/client";

const resellers: Prisma.ResellerCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Revenda Agricola",
    registrationNumber: "12345678901234",
    phoneNumber: "+55 11 1234-5678",
    email: "revenda@example.com",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "Revenda Insumos",
    registrationNumber: "56789012345678",
    phoneNumber: "+55 21 9876-5432",
    email: "insumos@example.com",
    companyId: "00000000-0000-4000-a000-000000000002",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Revenda geral (excluída)",
    registrationNumber: "90123456789012",
    phoneNumber: "+55 31 1234-5678",
    email: "geral@example.com",
    companyId: "00000000-0000-4000-a000-000000000002",
    deletedAt: new Date(),
  },
];

export async function seedResellers(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.reseller.createMany({
    data: resellers,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Revendedores: ${count} criado(s), ${resellers.length - count} já existia(m).`,
  );
}
