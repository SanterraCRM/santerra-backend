import { Prisma } from "@prisma/client";

import { Role } from "../../domain/entities/role";

export const roleInclude = {
  permissions: { select: { permissionId: true } },
} satisfies Prisma.RoleInclude;

type PrismaRole = Prisma.RoleGetPayload<{ include: typeof roleInclude }>;

export class PrismaRoleMapper {
  static toDomain(raw: PrismaRole): Role {
    return Role.reconstitute({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      companyId: raw.companyId,
      permissionIds: raw.permissions.map((permission) => permission.permissionId),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }
}
