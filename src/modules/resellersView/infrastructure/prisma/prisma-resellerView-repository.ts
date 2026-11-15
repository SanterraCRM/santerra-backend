import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { ResellerView } from "../../domain/entities/resellersView";
import {
  ResellerViewRepository,
  FindResellersViewParams,
  FindResellersViewResult,
} from "../../domain/repositories/resellerView-repository";
import { PrismaResellerViewMapper } from "./prisma-resellerView-mapper";

@injectable()
export class PrismaResellerViewRepository
  implements ResellerViewRepository {
  constructor(
    private readonly prisma: PrismaClient,
  ) { }

  async findById(id: number): Promise<ResellerView | null> {
    const resellerView = await this.prisma.resellersView.findFirst({
      where: {
        id,
      },
    });

    return resellerView
      ? PrismaResellerViewMapper.toDomain(resellerView)
      : null;
  }

  async findMany(
    params: FindResellersViewParams,
  ): Promise<FindResellersViewResult> {
    const where = params.search
      ? {
        name: {
          contains: params.search,
        },
      }
      : {};

    const [resellerView, total] = await Promise.all([
      this.prisma.resellersView.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: {
          name: "asc",
        },
      }),

      this.prisma.resellersView.count({
        where,
      }),
    ]);

    return {
      resellersView: resellerView.map(PrismaResellerViewMapper.toDomain),
      total,
    };
  };
}