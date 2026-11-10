import { Prisma, Harvest as PrismaHarvest } from "@prisma/client";

import { Harvest } from "../../domain/entities/harvest";
import { HarvestDetails } from "../../domain/repositories/harvest-repository";

export const harvestDetailsInclude = {
  _count: {
    select: {
      commercialTrips: { where: { commercialTrip: { deletedAt: null } } },
    },
  },
} satisfies Prisma.HarvestInclude;

type PrismaHarvestDetails = Prisma.HarvestGetPayload<{ include: typeof harvestDetailsInclude }>;

export class PrismaHarvestMapper {
  static toDomain(raw: PrismaHarvest): Harvest {
    return Harvest.reconstitute({
      id: raw.id,
      name: raw.name,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toDetails({ _count, ...raw }: PrismaHarvestDetails): HarvestDetails {
    return {
      harvest: PrismaHarvestMapper.toDomain(raw),
      tripsCount: _count.commercialTrips,
    };
  }
}
