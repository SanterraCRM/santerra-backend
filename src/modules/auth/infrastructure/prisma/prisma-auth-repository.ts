import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import {
  AuthRepository,
  CompanyAccess,
  CreateCompanyWithOwnerParams,
  UserCompanySummary,
} from "../../domain/repositories/auth-repository";

const companySummarySelect = {
  id: true,
  name: true,
  logo: true,
} satisfies Prisma.CompanySelect;

function activeMembershipWhere(userId: string): Prisma.UserCompanyWhereInput {
  return {
    userId,
    active: true,
    deletedAt: null,
    company: { deletedAt: null },
  };
}

@injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findCompanies(userId: string): Promise<UserCompanySummary[]> {
    const memberships = await this.prisma.userCompany.findMany({
      where: activeMembershipWhere(userId),
      select: { company: { select: companySummarySelect } },
      orderBy: { company: { name: "asc" } },
    });

    return memberships.map((membership) => membership.company);
  }

  async findAccess(
    userId: string,
    companyId: string,
  ): Promise<CompanyAccess | null> {
    const membership = await this.prisma.userCompany.findFirst({
      where: { ...activeMembershipWhere(userId), companyId },
      select: {
        id: true,
        isOwner: true,
        company: { select: companySummarySelect },
        userRoles: {
          where: { role: { deletedAt: null } },
          select: {
            role: {
              select: {
                permissions: { select: { permission: { select: { name: true } } } },
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return null;
    }

    const rolePermissions = new Set(
      membership.userRoles.flatMap((userRole) =>
        userRole.role.permissions.map(
          (rolePermission) => rolePermission.permission.name,
        ),
      ),
    );

    return {
      userCompanyId: membership.id,
      company: membership.company,
      isOwner: membership.isOwner,
      rolePermissions: [...rolePermissions],
    };
  }

  async createCompanyWithOwner({
    user,
    company,
    ownerRole,
    owner,
    emailVerification,
  }: CreateCompanyWithOwnerParams): Promise<void> {
    const { permissionIds, ...roleData } = ownerRole.toObject();
    const ownerData = owner.toObject();
    const emailVerificationData = emailVerification?.toObject();

    await this.prisma.$transaction([
      ...(emailVerificationData
        ? [
            this.prisma.emailVerification.update({
              where: {
                id: emailVerificationData.id,
                usedAt: null,
              },
              data: {
                usedAt: emailVerificationData.usedAt,
              },
            }),
          ]
        : []),
      ...(user ? [this.prisma.user.create({ data: user.toObject() })] : []),
      this.prisma.company.create({ data: company.toObject() }),
      this.prisma.role.create({
        data: {
          ...roleData,
          permissions: {
            createMany: {
              data: permissionIds.map((permissionId) => ({ permissionId })),
            },
          },
        },
      }),
      this.prisma.userCompany.create({
        data: {
          id: ownerData.id,
          userId: ownerData.userId,
          companyId: ownerData.companyId,
          isOwner: ownerData.isOwner,
          active: ownerData.active,
          createdAt: ownerData.createdAt,
          updatedAt: ownerData.updatedAt,
          createdById: ownerData.createdById,
        },
      }),
      this.prisma.userRole.createMany({
        data: ownerData.roleIds.map((roleId) => ({
          roleId,
          userCompanyId: ownerData.id,
          companyId: ownerData.companyId,
        })),
      }),
    ]);
  }
}
