import { Prisma } from "@prisma/client";

import { Member } from "../../domain/entities/member";
import { MemberDetails } from "../../domain/repositories/member-repository";

export const memberInclude = {
  user: { select: { name: true, email: true } },
  userRoles: {
    where: { role: { deletedAt: null } },
    select: { roleId: true },
  },
} satisfies Prisma.UserCompanyInclude;

export const memberDetailsInclude = {
  ...memberInclude,
  employee: {
    select: {
      id: true,
      deletedAt: true,
      person: { select: { id: true, name: true, deletedAt: true } },
    },
  },
} satisfies Prisma.UserCompanyInclude;

type PrismaMember = Prisma.UserCompanyGetPayload<{ include: typeof memberInclude }>;
type PrismaMemberDetails = Prisma.UserCompanyGetPayload<{
  include: typeof memberDetailsInclude;
}>;

export class PrismaMemberMapper {
  static toDomain(raw: PrismaMember): Member {
    return Member.reconstitute({
      id: raw.id,
      userId: raw.userId,
      companyId: raw.companyId,
      name: raw.user.name,
      email: raw.user.email,
      isOwner: raw.isOwner,
      active: raw.active,
      roleIds: raw.userRoles.map((userRole) => userRole.roleId),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toDetails({ employee, ...raw }: PrismaMemberDetails): MemberDetails {
    const isActiveEmployee = employee && !employee.deletedAt && !employee.person.deletedAt;

    return {
      member: PrismaMemberMapper.toDomain(raw),
      employee: isActiveEmployee
        ? { id: employee.id, person: { id: employee.person.id, name: employee.person.name } }
        : null,
    };
  }
}
