import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { ProductView } from "../../domain/entities/productView";
import {
  ProductViewRepository,
  FindProductsViewParams,
  FindProductsViewResult,
} from "../../domain/repositories/productView-repository";
import { PrismaProductViewMapper } from "./prisma-productView-mapper";

@injectable()
export class PrismaProductViewRepository
  implements ProductViewRepository {
  constructor(
    private readonly prisma: PrismaClient,
  ) { }

  async findById(id: number): Promise<ProductView | null> {
    const productView = await this.prisma.productsView.findFirst({
      where: {
        id,
      },
    });

    return productView
      ? PrismaProductViewMapper.toDomain(productView)
      : null;
  }

  async findMany(
    params: FindProductsViewParams,
  ): Promise<FindProductsViewResult> {
    const where = params.search
      ? {
        product: {
          contains: params.search,
        },
      }
      : {};

    const [productView, total] = await Promise.all([
      this.prisma.productsView.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: {
          product: "asc",
        },
      }),

      this.prisma.productsView.count({
        where,
      }),
    ]);

    return {
      productsView: productView.map(PrismaProductViewMapper.toDomain),
      total,
    };
  };
}