import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Member } from "../../domain/entities/member";
import {
  MemberRepository,
  FindMembersParams,
  FindMembersResult,
  MemberDetails,
  MemberWalletUsage,
} from "../../domain/repositories/member-repository";

const ACTIVE_WALLET = { deletedAt: null };
import {
  PrismaMemberMapper,
  memberDetailsInclude,
  memberInclude,
} from "./prisma-member-mapper";

@injectable()
export class PrismaMemberRepository implements MemberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<Member | null> {
    const member = await this.prisma.userCompany.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
      include: memberInclude,
    });

    return member ? PrismaMemberMapper.toDomain(member) : null;
  }

  async findDetailsById(id: string, companyId: string): Promise<MemberDetails | null> {
    const member = await this.prisma.userCompany.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: memberDetailsInclude,
    });

    return member ? PrismaMemberMapper.toDetails(member) : null;
  }

  async findByUserId(
    userId: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<Member | null> {
    const member = await this.prisma.userCompany.findFirst({
      where: {
        userId,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
      include: memberInclude,
    });

    return member ? PrismaMemberMapper.toDomain(member) : null;
  }

  async findMany(params: FindMembersParams): Promise<FindMembersResult> {
    const where: Prisma.UserCompanyWhereInput = {
      companyId: params.companyId,
      deletedAt: params.includeDeleted ? undefined : null,
      active: params.active,
      userRoles: params.roleId
        ? { some: { roleId: params.roleId, role: { deletedAt: null } } }
        : undefined,
      wallets:
        params.hasWallet === undefined
          ? undefined
          : params.hasWallet
            ? { some: ACTIVE_WALLET }
            : { none: ACTIVE_WALLET },
      user: params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : undefined,
    };

    const [members, total] = await this.prisma.$transaction([
      this.prisma.userCompany.findMany({
        where,
        include: memberDetailsInclude,
        orderBy:
          params.sort === "name" ? [{ user: { name: "asc" } }, { id: "asc" }] : { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.userCompany.count({ where }),
    ]);

    return {
      members: members.map(PrismaMemberMapper.toDetails),
      total,
    };
  }

  async update(member: Member): Promise<MemberDetails> {
    const data = member.toObject();
    const [, , updatedMember] = await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userCompanyId: data.id } }),
      this.prisma.userRole.createMany({
        data: data.roleIds.map((roleId) => ({
          roleId,
          userCompanyId: data.id,
          companyId: data.companyId,
        })),
      }),
      this.prisma.userCompany.update({
        where: {
          id: data.id,
          companyId: data.companyId,
          deletedAt: null,
        },
        data: {
          active: data.active,
          updatedAt: data.updatedAt,
          updatedById: data.updatedById,
        },
        include: memberDetailsInclude,
      }),
    ]);

    return PrismaMemberMapper.toDetails(updatedMember);
  }

  async findWalletUsage(id: string, companyId: string): Promise<MemberWalletUsage | null> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { userCompanyId: id, companyId, ...ACTIVE_WALLET },
      select: {
        value: true,
        _count: { select: { commercialActions: { where: { deletedAt: null } } } },
      },
    });

    return wallet
      ? { balance: wallet.value.toNumber(), actionsCount: wallet._count.commercialActions }
      : null;
  }

  async delete(member: Member): Promise<void> {
    const data = member.toObject();

    await this.prisma.$transaction([
      this.prisma.employee.updateMany({
        where: { userCompanyId: data.id, companyId: data.companyId },
        data: { userCompanyId: null },
      }),
      this.prisma.wallet.updateMany({
        where: { userCompanyId: data.id, companyId: data.companyId, ...ACTIVE_WALLET },
        data: { deletedAt: data.deletedAt, deletedById: data.deletedById },
      }),
      this.prisma.userCompany.update({
        where: {
          id: data.id,
          companyId: data.companyId,
          deletedAt: null,
        },
        data: {
          deletedAt: data.deletedAt,
          deletedById: data.deletedById,
        },
      }),
    ]);
  }
}
