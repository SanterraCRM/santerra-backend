import { Prisma, PrismaClient } from "@prisma/client";

const manufacturers: Prisma.ManufacturerCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Bayer",
    registrationNumber: "12345678901234",
    phoneNumber: "+55 11 1234-5678",
    email: "bayer@example.com",
    passwordHash: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQ5f8a5V5F5F5F5F5F5F5",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "Corteja Agroscience",
    registrationNumber: "56789012345678",
    phoneNumber: "+55 21 9876-5432",
    email: "corteja@example.com",
    passwordHash: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQ5f8a5V5F5F5F5F5F5F5",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "BASF (excluída)",
    registrationNumber: "90123456789012",
    phoneNumber: "+55 31 1234-5678",
    email: "basf@example.com",
    passwordHash: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQ5f8a5V5F5F5F5F5F5F5",
    deletedAt: new Date(),
  },
];

export async function seedManufacturers(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.manufacturer.createMany({
    data: manufacturers,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Fornecedores: ${count} criado(s), ${manufacturers.length - count} já existia(m).`,
  );
}
