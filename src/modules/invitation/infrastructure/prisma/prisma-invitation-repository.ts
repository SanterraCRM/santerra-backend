import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Invitation } from "../../domain/entities/invitation";
import {
  AcceptInvitationParams,
  FindInvitationsParams,
  FindInvitationsResult,
  InvitationRepository,
  InvitationStatus,
} from "../../domain/repositories/invitation-repository";
import {
  PrismaInvitationMapper,
  invitationInclude,
} from "./prisma-invitation-mapper";

function statusFilter(status: InvitationStatus, now: Date): Prisma.InvitationWhereInput {
  if (status === "accepted") {
    return { acceptedAt: { not: null } };
  }

  return {
    acceptedAt: null,
    expiresAt: status === "pending" ? { gt: now } : { lte: now },
  };
}

@injectable()
export class PrismaInvitationRepository implements InvitationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(invitation: Invitation): Promise<Invitation> {
    const { roleIds, ...data } = invitation.toObject();
    const createdInvitation = await this.prisma.invitation.create({
      data: {
        ...data,
        roles: {
          createMany: {
            data: roleIds.map((roleId) => ({ roleId })),
          },
        },
      },
      include: invitationInclude,
    });

    return PrismaInvitationMapper.toDomain(createdInvitation);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<Invitation | null> {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
      include: invitationInclude,
    });

    return invitation ? PrismaInvitationMapper.toDomain(invitation) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<Invitation | null> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash },
      include: invitationInclude,
    });

    return invitation ? PrismaInvitationMapper.toDomain(invitation) : null;
  }

  async findPendingByEmail(
    email: string,
    companyId: string,
  ): Promise<Invitation | null> {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        email,
        companyId,
        acceptedAt: null,
        deletedAt: null,
      },
      include: invitationInclude,
    });

    return invitation ? PrismaInvitationMapper.toDomain(invitation) : null;
  }

  async findMany(params: FindInvitationsParams): Promise<FindInvitationsResult> {
    const where: Prisma.InvitationWhereInput = {
      companyId: params.companyId,
      deletedAt: params.includeDeleted ? undefined : null,
      email: params.search
        ? { contains: params.search, mode: "insensitive" }
        : undefined,
      ...(params.status ? statusFilter(params.status, new Date()) : {}),
    };

    const [invitations, total] = await this.prisma.$transaction([
      this.prisma.invitation.findMany({
        where,
        include: invitationInclude,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.invitation.count({ where }),
    ]);

    return {
      invitations: invitations.map(PrismaInvitationMapper.toDomain),
      total,
    };
  }

  async delete(invitation: Invitation): Promise<void> {
    const data = invitation.toObject();

    await this.prisma.invitation.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        deletedAt: data.deletedAt,
        deletedById: data.deletedById,
      },
    });
  }

  async accept({ invitation, member, newUser }: AcceptInvitationParams): Promise<void> {
    const invitationData = invitation.toObject();
    const memberData = member.toObject();

    await this.prisma.$transaction([
      ...(newUser ? [this.prisma.user.create({ data: newUser.toObject() })] : []),
      this.prisma.userCompany.upsert({
        where: {
          userId_companyId: {
            userId: memberData.userId,
            companyId: memberData.companyId,
          },
        },
        create: {
          id: memberData.id,
          userId: memberData.userId,
          companyId: memberData.companyId,
          isOwner: memberData.isOwner,
          active: memberData.active,
          createdAt: memberData.createdAt,
          updatedAt: memberData.updatedAt,
          createdById: memberData.createdById,
        },
        update: {
          active: memberData.active,
          deletedAt: memberData.deletedAt,
          deletedById: memberData.deletedById,
          updatedAt: memberData.updatedAt,
          updatedById: memberData.updatedById,
        },
      }),
      this.prisma.userRole.deleteMany({ where: { userCompanyId: memberData.id } }),
      this.prisma.userRole.createMany({
        data: memberData.roleIds.map((roleId) => ({
          roleId,
          userCompanyId: memberData.id,
          companyId: memberData.companyId,
        })),
      }),
      this.prisma.invitation.update({
        where: {
          id: invitationData.id,
          acceptedAt: null,
          deletedAt: null,
        },
        data: {
          acceptedAt: invitationData.acceptedAt,
          updatedAt: invitationData.updatedAt,
        },
      }),
    ]);
  }
}
