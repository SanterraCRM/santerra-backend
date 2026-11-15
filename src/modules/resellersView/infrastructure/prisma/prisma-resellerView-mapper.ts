import { Prisma } from "@prisma/client";
import { ResellerView } from "../../domain/entities/resellersView";

export class PrismaResellerViewMapper {
  static toDomain(raw: Prisma.resellersViewGetPayload<object>): ResellerView {
    return {
      ...raw,
      lastBuyValue: raw.lastBuyValue?.toNumber() ?? null,
      creditLimitValue: raw.creditLimitValue?.toNumber() ?? null,
    };
  }
}