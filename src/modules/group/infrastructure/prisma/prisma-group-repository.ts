import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Group } from "../../domain/entities/group";
import {
  GroupRepository,
  FindGroupsParams,
  FindGroupsResult,
  GroupDetails,
} from "../../domain/repositories/group-repository";
import { PrismaGroupMapper, groupDetailsInclude } from "./prisma-group-mapper";

@injectable()
export class PrismaGroupRepository implements GroupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(group: Group): Promise<GroupDetails> {
    const data = group.toObject();
    const createdGroup = await this.prisma.group.create({
      data,
      include: groupDetailsInclude,
    });

    return PrismaGroupMapper.toDetails(createdGroup);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<Group | null> {
    const group = await this.prisma.group.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
    });

    return group ? PrismaGroupMapper.toDomain(group) : null;
  }

  async findDetailsById(id: string, companyId: string): Promise<GroupDetails | null> {
    const group = await this.prisma.group.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: groupDetailsInclude,
    });

    return group ? PrismaGroupMapper.toDetails(group) : null;
  }

  async findByName(name: string, companyId: string): Promise<Group | null> {
    const group = await this.prisma.group.findFirst({
      where: {
        name,
        companyId,
        deletedAt: null,
      },
    });

    return group ? PrismaGroupMapper.toDomain(group) : null;
  }

  async findManyByIds(ids: string[], companyId: string): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      where: {
        id: { in: ids },
        companyId,
        deletedAt: null,
      },
    });

    return groups.map(PrismaGroupMapper.toDomain);
  }

  async findMany(params: FindGroupsParams): Promise<FindGroupsResult> {
    const where: Prisma.GroupWhereInput = {
      companyId: params.companyId,
      deletedAt: params.includeDeleted ? undefined : null,
      createdAt: { gte: params.createdFrom, lte: params.createdTo },
      OR: params.search
        ? [
            { name: { contains: params.search, mode: "insensitive" } },
            { description: { contains: params.search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [groups, total] = await this.prisma.$transaction([
      this.prisma.group.findMany({
        where,
        include: groupDetailsInclude,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      groups: groups.map(PrismaGroupMapper.toDetails),
      total,
    };
  }

  async update(group: Group): Promise<GroupDetails> {
    const data = group.toObject();
    const updatedGroup = await this.prisma.group.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        name: data.name,
        description: data.description,
        updatedAt: data.updatedAt,
        updatedById: data.updatedById,
      },
      include: groupDetailsInclude,
    });

    return PrismaGroupMapper.toDetails(updatedGroup);
  }

  async delete(group: Group): Promise<void> {
    const data = group.toObject();

    await this.prisma.group.update({
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
}
