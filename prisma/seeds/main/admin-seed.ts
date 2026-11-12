import { Prisma } from "@prisma/client";
import argon2 from "argon2";

import { SANTERRA } from "./company-seed";
import { ADMINISTRATOR_ROLE } from "./roles";

export const ADMIN = {
  name: "Santerra Admin",
  email: "admin@santerra.com",
};

interface SeedAdminInput {
  companyId: string;
  administratorRoleId: string;
  password: string;
}

interface Membership {
  userId: string;
  companyId: string;
}

export async function seedAdmin(
  tx: Prisma.TransactionClient,
  { companyId, administratorRoleId, password }: SeedAdminInput,
  report: string[],
): Promise<void> {
  const userId = await findOrCreateUser(tx, password, report);
  const userCompanyId = await findOrCreateMembership(tx, { userId, companyId }, report);

  const { count } = await tx.userRole.createMany({
    data: { roleId: administratorRoleId, userCompanyId, companyId },
    skipDuplicates: true,
  });
  report.push(
    `Cargo "${ADMINISTRATOR_ROLE}" de ${ADMIN.email}: ${count > 0 ? "atribuído." : "já existia."}`,
  );
}

async function findOrCreateUser(
  tx: Prisma.TransactionClient,
  password: string,
  report: string[],
): Promise<string> {
  const existing = await tx.user.findFirst({
    where: { email: ADMIN.email, deletedAt: null },
    select: { id: true },
  });

  if (existing) {
    report.push(`Usuário ${ADMIN.email}: já existia, sem alterações (a senha não muda).`);
    return existing.id;
  }

  const user = await tx.user.create({
    data: {
      ...ADMIN,
      passwordHash: await argon2.hash(password),
      isPlatformAdmin: true,
      active: true,
    },
    select: { id: true },
  });
  report.push(`Usuário ${ADMIN.email}: criado como admin da plataforma.`);

  return user.id;
}

async function findOrCreateMembership(
  tx: Prisma.TransactionClient,
  membership: Membership,
  report: string[],
): Promise<string> {
  const subject = `Membro ${ADMIN.email} na empresa "${SANTERRA.name}"`;
  const existing = await tx.userCompany.findUnique({
    where: { userId_companyId: membership },
    select: { id: true },
  });

  if (existing) {
    report.push(`${subject}: já existia.`);
    return existing.id;
  }

  const created = await tx.userCompany.create({ data: membership, select: { id: true } });
  report.push(`${subject}: criado.`);

  return created.id;
}
