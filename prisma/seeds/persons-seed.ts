import { Prisma, PrismaClient } from "@prisma/client";

const persons: Prisma.PersonCreateManyInput[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Gabriel Sipriano",
    nationalId: "12345678900",
    phoneNumber: "11999999999",
    email: "sipriano@email.com",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "João Cesar",
    nationalId: "09876543210",
    phoneNumber: "11888888888",
    email: "joao@cesar.com",
    companyId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Pedro Venicio",
    nationalId: "11111111111",
    phoneNumber: "11777777777",
    email: "pedro@venicio.com",
    companyId: "00000000-0000-4000-a000-000000000002",
    deletedAt: new Date(),
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    name: "João Cesar",
    nationalId: "09876543210",
    phoneNumber: "11888888888",
    email: "joao@cesar.com",
    companyId: "00000000-0000-4000-a000-000000000002",
  },
];

export async function seedPersons(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.person.createMany({
    data: persons,
    skipDuplicates: true,
  });

  console.log(
    `[seed] Pessoas: ${count} criada(s), ${persons.length - count} já existia(m).`,
  );
}
