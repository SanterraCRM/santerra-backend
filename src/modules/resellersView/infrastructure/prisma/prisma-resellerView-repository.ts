import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { ResellerView } from "../../domain/entities/resellersView";
import {
  FindResellersViewParams,
  FindResellersViewResult,
  ResellerViewMissingField,
  ResellerViewRepository,
} from "../../domain/repositories/resellerView-repository";
import { PrismaResellerViewMapper } from "./prisma-resellerView-mapper";

const TIME_ZONE = "America/Sao_Paulo";

const localDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toUtcDay(value: Date | undefined): Date | undefined {
  return value ? new Date(`${localDayFormatter.format(value)}T00:00:00.000Z`) : undefined;
}

function missingFilter(field: ResellerViewMissingField): Prisma.resellersViewWhereInput {
  return { OR: [{ [field]: null }, { [field]: "" }] };
}

@injectable()
export class PrismaResellerViewRepository implements ResellerViewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<ResellerView | null> {
    const resellerView = await this.prisma.resellersView.findFirst({
      where: { id },
    });

    return resellerView ? PrismaResellerViewMapper.toDomain(resellerView) : null;
  }

  async findManyByIds(ids: number[]): Promise<ResellerView[]> {
    if (ids.length === 0) {
      return [];
    }

    const resellersView = await this.prisma.resellersView.findMany({
      where: { id: { in: ids } },
    });

    return resellersView.map(PrismaResellerViewMapper.toDomain);
  }

  async findMany(params: FindResellersViewParams): Promise<FindResellersViewResult> {
    const where = this.buildWhere(params);

    const [resellerView, total] = await Promise.all([
      this.prisma.resellersView.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: [{ name: "asc" }, { id: "asc" }],
      }),
      this.prisma.resellersView.count({ where }),
    ]);

    return {
      resellersView: resellerView.map(PrismaResellerViewMapper.toDomain),
      total,
    };
  }

  private buildWhere(params: FindResellersViewParams): Prisma.resellersViewWhereInput {
    const conditions: Prisma.resellersViewWhereInput[] = [];

    if (params.search) {
      conditions.push({
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { fantasyName: { contains: params.search, mode: "insensitive" } },
          { document: { contains: params.search } },
        ],
      });
    }

    if (params.createdFrom || params.createdTo) {
      conditions.push({
        createdAt: { gte: toUtcDay(params.createdFrom), lte: toUtcDay(params.createdTo) },
      });
    }

    params.missing?.forEach((field) => conditions.push(missingFilter(field)));

    return conditions.length > 0 ? { AND: conditions } : {};
  }
}
