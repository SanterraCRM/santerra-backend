import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { File } from "../../domain/entities/file";
import {
  FileRepository,
  FindFilesParams,
  FindFilesResult,
} from "../../domain/repositories/file-repository";
import { PrismaFileMapper } from "./prisma-file-mapper";

@injectable()
export class PrismaFileRepository implements FileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(file: File): Promise<File> {
    const data = file.toObject();
    const createdFile = await this.prisma.file.create({ data });

    return PrismaFileMapper.toDomain(createdFile);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<File | null> {
    const file = await this.prisma.file.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
    });

    return file ? PrismaFileMapper.toDomain(file) : null;
  }

  async findManyByIds(ids: string[], companyId: string): Promise<File[]> {
    const files = await this.prisma.file.findMany({
      where: {
        id: { in: ids },
        companyId,
        deletedAt: null,
      },
    });

    return files.map(PrismaFileMapper.toDomain);
  }

  async findMany(params: FindFilesParams): Promise<FindFilesResult> {
    const where: Prisma.FileWhereInput = {
      companyId: params.companyId,
      deletedAt: params.includeDeleted ? undefined : null,
      originalName: params.search
        ? { contains: params.search, mode: "insensitive" }
        : undefined,
    };

    const [files, total] = await this.prisma.$transaction([
      this.prisma.file.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.file.count({ where }),
    ]);

    return {
      files: files.map(PrismaFileMapper.toDomain),
      total,
    };
  }

  async update(file: File): Promise<File> {
    const data = file.toObject();
    const updatedFile = await this.prisma.file.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        originalName: data.originalName,
        updatedAt: data.updatedAt,
        updatedById: data.updatedById,
      },
    });

    return PrismaFileMapper.toDomain(updatedFile);
  }

  async delete(file: File): Promise<void> {
    const data = file.toObject();

    await this.prisma.file.update({
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

  async deleteUnlinked(
    ids: string[],
    companyId: string,
    deletedById: string | null,
  ): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await this.prisma.file.updateMany({
      where: {
        id: { in: ids },
        companyId,
        deletedAt: null,
        products: { none: { product: { deletedAt: null } } },
        commercialTrips: { none: { commercialTrip: { deletedAt: null } } },
        commercialActions: { none: { commercialAction: { deletedAt: null } } },
      },
      data: { deletedAt: new Date(), deletedById },
    });
  }
}
