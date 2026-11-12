import { Event as PrismaEvent } from "@prisma/client";

import { Event } from "../../domain/entities/event";

export class PrismaEventMapper {
  static toDomain(raw: PrismaEvent): Event {
    return Event.reconstitute({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      companyId: raw.companyId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }
}
