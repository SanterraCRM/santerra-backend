import { Prisma } from "@prisma/client";

import { ALL_PERMISSIONS } from "../../../src/shared/application/auth/permissions";
import { ADMIN } from "./admin-seed";
import { SANTERRA } from "./company-seed";
import { ADMINISTRATOR_ROLE, ROLES } from "./roles";
import { throwIfProblems } from "./seed-error";

export async function verifySeed(
  tx: Prisma.TransactionClient,
  companyId: string,
): Promise<void> {
  const problems = [
    ...(await checkCompany(tx, companyId)),
    ...(await checkAdmin(tx, companyId)),
    ...(await checkRoles(tx, companyId)),
  ];

  throwIfProblems("A verificação final falhou:", problems);
}

async function checkCompany(tx: Prisma.TransactionClient, companyId: string): Promise<string[]> {
  const company = await tx.company.findUnique({
    where: { id: companyId },
    select: { deletedAt: true },
  });

  return company && !company.deletedAt
    ? []
    : [`A empresa "${SANTERRA.name}" não existe ou está excluída.`];
}

async function checkAdmin(tx: Prisma.TransactionClient, companyId: string): Promise<string[]> {
  const admin = await tx.user.findFirst({
    where: { email: ADMIN.email, deletedAt: null },
    select: {
      active: true,
      isPlatformAdmin: true,
      companyMemberships: {
        where: { companyId, active: true, deletedAt: null },
        select: {
          userRoles: {
            where: { role: { name: ADMINISTRATOR_ROLE, deletedAt: null } },
            select: { roleId: true },
          },
        },
      },
    },
  });

  if (!admin) {
    return [`O usuário ${ADMIN.email} não existe.`];
  }

  const [membership] = admin.companyMemberships;
  const problems: string[] = [];

  if (!admin.active) {
    problems.push(
      `O usuário ${ADMIN.email} está inativo. A seed não altera um usuário que já existe: reative-o pela plataforma ou no banco.`,
    );
  }

  if (!admin.isPlatformAdmin) {
    problems.push(
      `O usuário ${ADMIN.email} não é admin da plataforma. A seed não altera um usuário que já existe: defina isPlatformAdmin no banco.`,
    );
  }

  if (!membership) {
    problems.push(
      `${ADMIN.email} não é membro ativo da empresa "${SANTERRA.name}": o vínculo foi desativado ou removido, e a seed não altera um vínculo que já existe.`,
    );
  } else if (membership.userRoles.length === 0) {
    problems.push(
      `${ADMIN.email} não tem o cargo "${ADMINISTRATOR_ROLE}" na empresa "${SANTERRA.name}".`,
    );
  }

  return problems;
}

async function checkRoles(tx: Prisma.TransactionClient, companyId: string): Promise<string[]> {
  const roles = await tx.role.findMany({
    where: { companyId, deletedAt: null, name: { in: ROLES.map(({ name }) => name) } },
    select: { name: true, permissions: { select: { permission: { select: { name: true } } } } },
  });
  const permissionsByRole = new Map(
    roles.map(({ name, permissions }) => [
      name,
      new Set(permissions.map(({ permission }) => permission.name)),
    ]),
  );

  return ROLES.flatMap(({ name }) => {
    const permissions = permissionsByRole.get(name);

    if (!permissions) {
      return [`O cargo "${name}" não existe.`];
    }

    if (permissions.size === 0) {
      return [`O cargo "${name}" está sem permissões.`];
    }

    const missing =
      name === ADMINISTRATOR_ROLE
        ? ALL_PERMISSIONS.filter((permission) => !permissions.has(permission))
        : [];

    return missing.length > 0
      ? [`O cargo "${name}" está sem as permissões: ${missing.join(", ")}.`]
      : [];
  });
}
