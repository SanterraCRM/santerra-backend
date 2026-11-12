import { User as PrismaUser } from "@prisma/client";

import { User } from "../../domain/entities/user";

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.reconstitute({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      passwordHash: raw.passwordHash,
      isPlatformAdmin: raw.isPlatformAdmin,
      active: raw.active,
      lastLoginAt: raw.lastLoginAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }
}
