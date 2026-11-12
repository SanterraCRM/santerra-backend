import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { Potential } from "../../domain/entities/potential";
import {
  PotentialRepository,
  FindPotentialsParams,
  FindPotentialsResult,
} from "../../domain/repositories/potential-repository";
import { PrismaPotentialMapper } from "./prisma-potential-mapper";

const ACTIVE_PRODUCERS: Prisma.ProducerWhereInput = {
  deletedAt: null,
  person: { deletedAt: null },
};

@injectable()
export class PrismaPotentialRepository implements PotentialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(potential: Potential): Promise<Potential> {
    const data = potential.toObject();
    const createdPotential = await this.prisma.potential.create({ data });

    return PrismaPotentialMapper.toDomain(createdPotential);
  }

  async findById(
    id: string,
    companyId: string,
    includeDeleted = false,
  ): Promise<Potential | null> {
    const potential = await this.prisma.potential.findFirst({
      where: {
        id,
        companyId,
        deletedAt: includeDeleted ? undefined : null,
      },
    });

    return potential ? PrismaPotentialMapper.toDomain(potential) : null;
  }

  async findByName(name: string, companyId: string): Promise<Potential | null> {
    const potential = await this.prisma.potential.findFirst({
      where: {
        name,
        companyId,
        deletedAt: null,
      },
    });

    return potential ? PrismaPotentialMapper.toDomain(potential) : null;
  }

  async findMany(params: FindPotentialsParams): Promise<FindPotentialsResult> {
    const where: Prisma.PotentialWhereInput = {
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

    const [potentials, total] = await this.prisma.$transaction([
      this.prisma.potential.findMany({
        where,
        include: {
          _count: { select: { producers: { where: ACTIVE_PRODUCERS } } },
        },
        // O valor é uma escala (Alto 80, Médio 50): o maior vem primeiro, e sem valor por último.
        orderBy: [{ numericValue: { sort: "desc", nulls: "last" } }, { name: "asc" }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.potential.count({ where }),
    ]);

    return {
      potentials: potentials.map((potential) => ({
        potential: PrismaPotentialMapper.toDomain(potential),
        producersCount: potential._count.producers,
      })),
      total,
    };
  }

  async countProducers(id: string, companyId: string): Promise<number> {
    return this.prisma.producer.count({
      where: { ...ACTIVE_PRODUCERS, potentialId: id, companyId },
    });
  }

  async update(potential: Potential): Promise<Potential> {
    const data = potential.toObject();
    const updatedPotential = await this.prisma.potential.update({
      where: {
        id: data.id,
        companyId: data.companyId,
        deletedAt: null,
      },
      data: {
        name: data.name,
        numericValue: data.numericValue,
        description: data.description,
        updatedAt: data.updatedAt,
        updatedById: data.updatedById,
      },
    });

    return PrismaPotentialMapper.toDomain(updatedPotential);
  }

  async delete(potential: Potential): Promise<void> {
    const data = potential.toObject();

    await this.prisma.potential.update({
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
