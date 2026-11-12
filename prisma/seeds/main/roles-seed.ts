import { Prisma } from "@prisma/client";

import {
  ALL_PERMISSIONS,
  PermissionName,
} from "../../../src/shared/application/auth/permissions";
import { RoleDefinition, ROLES } from "./roles";
import { SeedError } from "./seed-error";

type PermissionIds = Record<PermissionName, string>;

interface SeedRoleInput {
  companyId: string;
  role: RoleDefinition;
  permissionIds: PermissionIds;
}

export async function seedRoles(
  tx: Prisma.TransactionClient,
  companyId: string,
  report: string[],
): Promise<Record<string, string>> {
  const permissionIds = await findPermissionIds(tx);
  const roleIds: Record<string, string> = {};

  for (const role of ROLES) {
    roleIds[role.name] = await seedRole(tx, { companyId, role, permissionIds }, report);
  }

  return roleIds;
}

async function findPermissionIds(tx: Prisma.TransactionClient): Promise<PermissionIds> {
  const permissions = await tx.permission.findMany({
    where: { name: { in: ALL_PERMISSIONS } },
    select: { id: true, name: true },
  });
  const ids = new Map(permissions.map(({ id, name }) => [name, id]));
  const missing = ALL_PERMISSIONS.filter((name) => !ids.has(name));

  if (missing.length > 0) {
    throw new SeedError(
      `Permissões que não existem no banco: ${missing.join(", ")}. Falta a migration com o INSERT delas: rode as migrations antes da seed.`,
    );
  }

  return Object.fromEntries(ids) as PermissionIds;
}

async function seedRole(
  tx: Prisma.TransactionClient,
  { companyId, role, permissionIds }: SeedRoleInput,
  report: string[],
): Promise<string> {
  const existing = await tx.role.findFirst({
    where: { companyId, name: role.name, deletedAt: null },
    select: {
      id: true,
      permissions: { select: { permissionId: true, permission: { select: { name: true } } } },
    },
  });

  if (!existing) {
    const created = await tx.role.create({
      data: {
        name: role.name,
        description: role.description,
        companyId,
        permissions: {
          createMany: {
            data: role.permissions.map((name) => ({ permissionId: permissionIds[name] })),
          },
        },
      },
      select: { id: true },
    });
    report.push(`Cargo "${role.name}": criado com ${role.permissions.length} permissões.`);

    return created.id;
  }

  const current = new Set(existing.permissions.map(({ permission }) => permission.name));
  const wanted = new Set<string>(role.permissions);
  const added = role.permissions.filter((name) => !current.has(name));
  const removed = existing.permissions.filter(({ permission }) => !wanted.has(permission.name));

  if (added.length > 0) {
    await tx.rolePermission.createMany({
      data: added.map((name) => ({ roleId: existing.id, permissionId: permissionIds[name] })),
    });
  }

  if (removed.length > 0) {
    await tx.rolePermission.deleteMany({
      where: {
        roleId: existing.id,
        permissionId: { in: removed.map(({ permissionId }) => permissionId) },
      },
    });
  }

  report.push(
    `Cargo "${role.name}": ${describeSync(added, removed.map(({ permission }) => permission.name))}`,
  );

  return existing.id;
}

function describeSync(added: string[], removed: string[]): string {
  const changes: string[] = [];

  if (added.length > 0) {
    changes.push(`adicionadas: ${added.join(", ")}`);
  }

  if (removed.length > 0) {
    changes.push(`removidas: ${removed.join(", ")}`);
  }

  return changes.length > 0
    ? `já existia, permissões atualizadas (${changes.join("; ")}).`
    : "já existia, com as permissões em dia.";
}
