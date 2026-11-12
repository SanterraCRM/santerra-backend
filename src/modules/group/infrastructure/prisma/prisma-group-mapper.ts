import { Prisma, Group as PrismaGroup } from "@prisma/client";

import { Group } from "../../domain/entities/group";
import { GroupDetails } from "../../domain/repositories/group-repository";

export const groupDetailsInclude = {
  _count: {
    select: { products: { where: { product: { deletedAt: null } } } },
  },
} satisfies Prisma.GroupInclude;

type PrismaGroupDetails = Prisma.GroupGetPayload<{ include: typeof groupDetailsInclude }>;

export class PrismaGroupMapper {
  static toDomain(raw: PrismaGroup): Group {
    return Group.reconstitute({
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

  static toDetails({ _count, ...raw }: PrismaGroupDetails): GroupDetails {
    return {
      group: PrismaGroupMapper.toDomain(raw),
      productsCount: _count.products,
    };
  }
}
