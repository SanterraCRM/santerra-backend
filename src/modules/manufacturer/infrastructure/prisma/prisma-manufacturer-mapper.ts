import { Manufacturer as PrismaManufacturer } from "@prisma/client";

import { Manufacturer } from "../../domain/entities/manufacturer";

export class PrismaManufacturerMapper {
  static toDomain(raw: PrismaManufacturer): Manufacturer {
    return Manufacturer.reconstitute({
      id: raw.id,
      name: raw.name,
      registrationNumber: raw.registrationNumber,
      phoneNumber: raw.phoneNumber,
      email: raw.email,
      passwordHash: raw.passwordHash,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }
}
