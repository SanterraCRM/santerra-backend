import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Harvest } from "../../domain/entities/harvest";
import {
  HarvestRepository,
  FindHarvestsParams,
  FindHarvestsResult,
  HarvestDetails,
} from "../../domain/repositories/harvest-repository";
import { PrismaHarvestMapper, harvestDetailsInclude } from "./prisma-harvest-mapper";

@injectable()
export class PrismaHarvestRepository implements HarvestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(harvest: Harvest): Promise<HarvestDetails> {
    const data = harvest.toObject();
    const createdHarvest = await this.prisma.harvest.create({
      data,
      include: harvestDetailsInclude,
    });

    return PrismaHarvestMapper.toDetails(createdHarvest);
  }

  async findById(id: string, includeDeleted = false): Promise<Harvest | null> {
    const harvest = await this.prisma.harvest.findFirst({
      where: {
        id,
        deletedAt: includeDeleted ? undefined : null,
      },
    });

    return harvest ? PrismaHarvestMapper.toDomain(harvest) : null;
  }

  async findDetailsById(id: string): Promise<HarvestDetails | null> {
    const harvest = await this.prisma.harvest.findFirst({
      where: { id, deletedAt: null },
      include: harvestDetailsInclude,
    });

    return harvest ? PrismaHarvestMapper.toDetails(harvest) : null;
  }

  async findByName(name: string): Promise<Harvest | null> {
    const harvest = await this.prisma.harvest.findFirst({
      where: { name, deletedAt: null },
    });

    return harvest ? PrismaHarvestMapper.toDomain(harvest) : null;
  }

  async findManyByIds(ids: string[]): Promise<Harvest[]> {
    const harvests = await this.prisma.harvest.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
    });

    return harvests.map(PrismaHarvestMapper.toDomain);
  }

  async findMany(params: FindHarvestsParams): Promise<FindHarvestsResult> {
    const where: Prisma.HarvestWhereInput = {
      deletedAt: params.includeDeleted ? undefined : null,
      createdAt: { gte: params.createdFrom, lte: params.createdTo },
      name: params.search ? { contains: params.search, mode: "insensitive" } : undefined,
    };

    const [harvests, total] = await this.prisma.$transaction([
      this.prisma.harvest.findMany({
        where,
        include: harvestDetailsInclude,
        orderBy: { name: "asc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.harvest.count({ where }),
    ]);

    return {
      harvests: harvests.map(PrismaHarvestMapper.toDetails),
      total,
    };
  }

  async update(harvest: Harvest): Promise<HarvestDetails> {
    const data = harvest.toObject();
    const updatedHarvest = await this.prisma.harvest.update({
      where: {
        id: data.id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        updatedAt: data.updatedAt,
        updatedById: data.updatedById,
      },
      include: harvestDetailsInclude,
    });

    return PrismaHarvestMapper.toDetails(updatedHarvest);
  }

  async delete(harvest: Harvest): Promise<void> {
    const data = harvest.toObject();

    await this.prisma.harvest.update({
      where: {
        id: data.id,
        deletedAt: null,
      },
      data: {
        deletedAt: data.deletedAt,
        deletedById: data.deletedById,
      },
    });
  }
}
