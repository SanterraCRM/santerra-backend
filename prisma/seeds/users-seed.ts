import { Prisma, PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const DEFAULT_PASSWORD = "Senha@123";

const users: Omit<Prisma.UserCreateManyInput, "passwordHash">[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Gabriel Sipriano",
    email: "sipriano@email.com",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "João Cesar",
    email: "joao@cesar.com",
    active: false,
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Pedro Venicio",
    email: "pedro@venicio.com",
    deletedAt: new Date(),
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    name: "Maria Souza",
    email: "maria@valeverde.com",
  },
  {
    id: "00000000-0000-4000-a000-000000000005",
    name: "Admin da Plataforma",
    email: "admin@santerra.com",
    isPlatformAdmin: true,
  },
];

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  const passwordHash = await argon2.hash(DEFAULT_PASSWORD);

  const { count } = await prisma.user.createMany({
    data: users.map((user) => ({ ...user, passwordHash })),
    skipDuplicates: true,
  });

  console.log(
    `[seed] Usuários: ${count} criado(s), ${users.length - count} já existia(m).`,
  );
}
