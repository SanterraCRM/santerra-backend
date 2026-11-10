import { HarvestProps } from "../../domain/entities/harvest";
import { HarvestDetails } from "../../domain/repositories/harvest-repository";

export interface HarvestDetailsDto extends HarvestProps {
  tripsCount: number;
}

export function toHarvestDetailsDto({ harvest, tripsCount }: HarvestDetails): HarvestDetailsDto {
  return { ...harvest.toObject(), tripsCount };
}
