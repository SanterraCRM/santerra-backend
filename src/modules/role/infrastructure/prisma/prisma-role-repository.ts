import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Role } from "../../domain/entities/role";
import {
  RoleRepository,
  FindRolesParams,
  FindRolesResult,
} from "../../domain/repositories/role-repository";
import { PrismaRoleMapper, roleInclude } from "./prisma-role-mapper";

const ASSIGNED_MEMBERS: Prisma.UserRoleWhereInput = { userCompany: { deletedAt: null } };

@injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(role: Role): Promise<Role> {
    const { permissionIds, ...data } = role.toObject();
    const createdRole = await this.prisma.role.create({
      data: {
        ...data,
        permissions: {
          createMany: {
            data: permissionIds.map((permissionId) => ({ permissionId })),
          },
        },
      },
      include: roleInclude,
    });

    return PrismaRoleMapper.toDomain(createdRole);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<Role | null> {
    const role = await this.prisma.role.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
      include: roleInclude,
    });

    return role ? PrismaRoleMapper.toDomain(role) : null;
  }

  async findByName(name: string, companyId: string): Promise<Role | null> {
    const role = await this.prisma.role.findFirst({
      where: {
        name,
        companyId,
        deletedAt: null,
      },
      include: roleInclude,
    });

    return role ? PrismaRoleMapper.toDomain(role) : null;
  }

  async findManyByIds(ids: string[], companyId: string): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: {
        id: { in: ids },
        companyId,
        deletedAt: null,
      },
      include: roleInclude,
    });

    return roles.map(PrismaRoleMapper.toDomain);
  }

  async findMany(params: FindRolesParams): Promise<FindRolesResult> {
    const where: Prisma.RoleWhereInput = {
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

    const [roles, total] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        where,
        include: {
          ...roleInclude,
          _count: { select: { userRoles: { where: ASSIGNED_MEMBERS } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      roles: roles.map((role) => ({
        role: PrismaRoleMapper.toDomain(role),
        membersCount: role._count.userRoles,
      })),
      total,
    };
  }

  async countMembers(id: string, companyId: string): Promise<number> {
    return this.prisma.userRole.count({
      where: { ...ASSIGNED_MEMBERS, roleId: id, companyId },
    });
  }

  async update(role: Role): Promise<Role> {
    const { permissionIds, ...data } = role.toObject();
    const [, , updatedRole] = await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId: data.id } }),
      this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: data.id,
          permissionId,
        })),
      }),
      this.prisma.role.update({
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
        include: roleInclude,
      }),
    ]);

    return PrismaRoleMapper.toDomain(updatedRole);
  }

  async delete(role: Role): Promise<void> {
    const data = role.toObject();

    await this.prisma.role.update({
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
