import { PotentialProps } from "../../domain/entities/potential";

export interface PotentialListItemDto extends PotentialProps {
  producersCount: number;
}
