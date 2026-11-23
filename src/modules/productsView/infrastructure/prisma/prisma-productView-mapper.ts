import { Prisma } from "@prisma/client";
import { ProductView } from "../../domain/entities/productView";

// Algumas colunas da view vêm com espaços à direita (ex.: cd_fabric "6     ", departamento).
export function trimViewText(value: string | null): string | null {
  return value?.trim() || null;
}

export class PrismaProductViewMapper {
  static toDomain(raw: Prisma.productsViewGetPayload<object>): ProductView {
    return {
      ...raw,
      product: trimViewText(raw.product),
      manufacturerId: trimViewText(raw.manufacturerId),
      manufacturer: trimViewText(raw.manufacturer),
      department: trimViewText(raw.department),
      section: trimViewText(raw.section),
      category: trimViewText(raw.category),
      line: trimViewText(raw.line),
      stockUnity: trimViewText(raw.stockUnity),
      purchaseUnity: trimViewText(raw.purchaseUnity),
      ncm: trimViewText(raw.ncm),
      weight: raw.weight?.toNumber() ?? null,
      weightNet: raw.weightNet?.toNumber() ?? null,
      volume: raw.volume?.toNumber() ?? null,
    };
  }
}