import { Prisma, Reseller as PrismaReseller } from "@prisma/client";

import { Reseller } from "../../domain/entities/reseller";
import { ResellerDetails } from "../../domain/repositories/reseller-repository";

export const resellerDetailsInclude = {
  _count: {
    select: {
      commercialActionGuests: { where: { commercialAction: { deletedAt: null } } },
    },
  },
} satisfies Prisma.ResellerInclude;

type PrismaResellerDetails = Prisma.ResellerGetPayload<{
  include: typeof resellerDetailsInclude;
}>;

export class PrismaResellerMapper {
  static toDomain(raw: PrismaReseller): Reseller {
    return Reseller.reconstitute({
      id: raw.id,
      name: raw.name,
      registrationNumber: raw.registrationNumber,
      phoneNumber: raw.phoneNumber,
      email: raw.email,
      companyId: raw.companyId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toDetails({ _count, ...raw }: PrismaResellerDetails): ResellerDetails {
    return {
      reseller: PrismaResellerMapper.toDomain(raw),
      actionsCount: _count.commercialActionGuests,
    };
  }
}
