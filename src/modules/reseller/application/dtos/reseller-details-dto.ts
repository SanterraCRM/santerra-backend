import { ResellerProps } from "../../domain/entities/reseller";
import { ResellerDetails } from "../../domain/repositories/reseller-repository";

export interface ResellerDetailsDto extends ResellerProps {
  actionsCount: number;
}

export function toResellerDetailsDto({
  reseller,
  actionsCount,
}: ResellerDetails): ResellerDetailsDto {
  return { ...reseller.toObject(), actionsCount };
}
