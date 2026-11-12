import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Permission } from "../../domain/entities/permission";
import {
  PermissionRepository,
  FindPermissionsParams,
  FindPermissionsResult,
} from "../../domain/repositories/permission-repository";
import { PrismaPermissionMapper } from "./prisma-permission-mapper";

@injectable()
export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(permission: Permission): Promise<Permission> {
    const data = permission.toObject();
    const createdPermission = await this.prisma.permission.create({ data });

    return PrismaPermissionMapper.toDomain(createdPermission);
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findFirst({
      where: {
        id,
      },
    });

    return permission ? PrismaPermissionMapper.toDomain(permission) : null;
  }

  async findAll(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { name: "asc" },
    });

    return permissions.map(PrismaPermissionMapper.toDomain);
  }

  async findMany(params: FindPermissionsParams): Promise<FindPermissionsResult> {
    const where: Prisma.PermissionWhereInput = {
      OR: params.search
        ? [
            { name: { contains: params.search, mode: "insensitive" } },
            { description: { contains: params.search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [permissions, total] = await this.prisma.$transaction([
      this.prisma.permission.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.permission.count({ where }),
    ]);

    return {
      permissions: permissions.map(PrismaPermissionMapper.toDomain),
      total,
    };
  }

  async update(permission: Permission): Promise<Permission> {
    const data = permission.toObject();
    const updatedPermission = await this.prisma.permission.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return PrismaPermissionMapper.toDomain(updatedPermission);
  }

  async delete(permission: Permission): Promise<void> {
    const data = permission.toObject();

    await this.prisma.permission.delete({
      where: {
        id: data.id,
      },
    });
  }
}
