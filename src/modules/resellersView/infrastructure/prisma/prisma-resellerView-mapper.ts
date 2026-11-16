import { Prisma } from "@prisma/client";
import { ResellerView } from "../../domain/entities/resellersView";

type RawResellerView = Prisma.resellersViewGetPayload<object>;

function trimTexts(raw: RawResellerView): RawResellerView {
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() || null : value,
    ]),
  ) as RawResellerView;
}

export class PrismaResellerViewMapper {
  static toDomain(raw: RawResellerView): ResellerView {
    const reseller = trimTexts(raw);

    return {
      ...reseller,
      lastBuyValue: reseller.lastBuyValue?.toNumber() ?? null,
      creditLimitValue: reseller.creditLimitValue?.toNumber() ?? null,
    };
  }
}
