import { Prisma } from "@prisma/client";
import { ProductView } from "../../domain/entities/productView";

export class PrismaProductViewMapper {
  static toDomain(raw: Prisma.productsViewGetPayload<object>): ProductView {
    return {
      ...raw,
      weight: raw.weight?.toNumber() ?? null,
      weightNet: raw.weightNet?.toNumber() ?? null,
      volume: raw.volume?.toNumber() ?? null,
    };
  }
}