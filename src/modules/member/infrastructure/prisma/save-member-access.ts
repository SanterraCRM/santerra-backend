import { Prisma } from "@prisma/client";

import { MemberAccess } from "../../domain/repositories/member-repository";

export async function saveMemberAccess(
  transaction: Prisma.TransactionClient,
  { member, newUser, addedById }: MemberAccess,
): Promise<void> {
  const data = member.toObject();

  if (newUser) {
    await transaction.user.create({ data: newUser.toObject() });
  }

  await transaction.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: data.userId,
        companyId: data.companyId,
      },
    },
    create: {
      id: data.id,
      userId: data.userId,
      companyId: data.companyId,
      isOwner: data.isOwner,
      active: data.active,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdById: data.createdById,
    },
    update: {
      active: data.active,
      deletedAt: data.deletedAt,
      deletedById: data.deletedById,
      updatedAt: data.updatedAt,
      updatedById: data.updatedById,
    },
  });
  await transaction.userRole.deleteMany({ where: { userCompanyId: data.id } });
  await transaction.userRole.createMany({
    data: data.roleIds.map((roleId) => ({
      roleId,
      userCompanyId: data.id,
      companyId: data.companyId,
    })),
  });
  await transaction.invitation.updateMany({
    where: {
      email: data.email,
      companyId: data.companyId,
      acceptedAt: null,
      deletedAt: null,
      expiresAt: { gt: data.updatedAt },
    },
    data: { deletedAt: data.updatedAt, deletedById: addedById },
  });
}
