import { PrismaClient } from "@prisma/client";

import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  PermissionName,
} from "../../src/shared/application/auth/permissions";

interface RoleSeed {
  id: string;
  name: string;
  description: string;
  companyId: string;
  deletedAt?: Date;
  permissions: PermissionName[];
}

const roles: RoleSeed[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Administrador",
    description: "Acesso a todas as funcionalidades da empresa.",
    companyId: "00000000-0000-4000-a000-000000000001",
    permissions: ALL_PERMISSIONS,
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "AGD",
    description: "Acesso a funcionalidades específicas para o papel de AGD.",
    companyId: "00000000-0000-4000-a000-000000000002",
    permissions: [PERMISSIONS.PERSONS_READ, PERMISSIONS.PRODUCTS_READ],
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Vendedor (excluída)",
    description: "Cargo com soft delete, não deve aparecer nas listagens.",
    companyId: "00000000-0000-4000-a000-000000000002",
    deletedAt: new Date(),
    permissions: [PERMISSIONS.PERSONS_READ],
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    name: "Administrador",
    description: "Acesso a todas as funcionalidades da empresa.",
    companyId: "00000000-0000-4000-a000-000000000002",
    permissions: ALL_PERMISSIONS,
  },
];

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  const { count } = await prisma.role.createMany({
    data: roles.map(({ permissions: _permissions, ...role }) => role),
    skipDuplicates: true,
  });

  const permissionIds = new Map(
    (await prisma.permission.findMany()).map((permission) => [
      permission.name,
      permission.id,
    ]),
  );

  await prisma.rolePermission.createMany({
    data: roles.flatMap((role) =>
      role.permissions.map((name) => {
        const permissionId = permissionIds.get(name);

        if (!permissionId) {
          throw new Error(
            `Permissão "${name}" não encontrada: falta uma migration com o INSERT dela.`,
          );
        }

        return { roleId: role.id, permissionId };
      }),
    ),
    skipDuplicates: true,
  });

  console.log(
    `[seed] Cargo: ${count} criado(s), ${roles.length - count} já existia(m).`,
  );
}
