import { Potential as PrismaPotential } from "@prisma/client";

import { Potential } from "../../domain/entities/potential";

export class PrismaPotentialMapper {
  static toDomain(raw: PrismaPotential): Potential {
    return Potential.reconstitute({
      id: raw.id,
      name: raw.name,
      numericValue: raw.numericValue?.toNumber() ?? null,
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
