import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { CropView } from "../../domain/entities/cropsView";
import {
  CropViewRepository,
  FindCropsViewParams,
  FindCropsViewResult,
} from "../../domain/repositories/cropView-repository";

@injectable()
export class PrismaCropViewRepository
  implements CropViewRepository {
  constructor(
    private readonly prisma: PrismaClient,
  ) { }

  async findByProductAndCrop(
    productId: number,
    crop: string
  ): Promise<CropView | null> {
    const cropView = await this.prisma.cropsView.findFirst({
      where: {
        productId,
        crop,
      },
    });

    return cropView
  }

  async findMany(
    params: FindCropsViewParams,
  ): Promise<FindCropsViewResult> {
    const where = params.search
      ? {
        crop: {
          contains: params.search,
        },
      }
      : {};

    const [cropsView, total] = await Promise.all([
      this.prisma.cropsView.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: {
          crop: "asc",
        },
      }),

      this.prisma.cropsView.count({
        where,
      }),
    ]);

    return {
      cropsView, total
    }
  };
}