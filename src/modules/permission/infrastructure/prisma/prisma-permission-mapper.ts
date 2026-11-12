import { Permission as PrismaPermission } from "@prisma/client";

import { Permission } from "../../domain/entities/permission";

export class PrismaPermissionMapper {
  static toDomain(raw: PrismaPermission): Permission {
    return Permission.reconstitute({
      id: raw.id,
      name: raw.name,
      description: raw.description,
    });
  }
}
