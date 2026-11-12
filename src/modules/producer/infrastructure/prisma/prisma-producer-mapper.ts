import { Producer as PrismaProducer } from "@prisma/client";

import { Producer } from "../../domain/entities/producer";

export class PrismaProducerMapper {
  static toDomain(raw: PrismaProducer): Producer {
    return Producer.reconstitute({
      id: raw.id,
      personId: raw.personId,
      potentialId: raw.potentialId,
      address: raw.address,
      mainCrop: raw.mainCrop,
      totalArea: raw.totalArea?.toNumber() ?? null,
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
