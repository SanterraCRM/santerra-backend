import { Prisma } from "@prisma/client";

import { Invitation } from "../../domain/entities/invitation";

export const invitationInclude = {
  roles: { select: { roleId: true } },
} satisfies Prisma.InvitationInclude;

type PrismaInvitation = Prisma.InvitationGetPayload<{
  include: typeof invitationInclude;
}>;

export class PrismaInvitationMapper {
  static toDomain(raw: PrismaInvitation): Invitation {
    return Invitation.reconstitute({
      id: raw.id,
      email: raw.email,
      roleIds: raw.roles.map((role) => role.roleId),
      tokenHash: raw.tokenHash,
      expiresAt: raw.expiresAt,
      acceptedAt: raw.acceptedAt,
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
