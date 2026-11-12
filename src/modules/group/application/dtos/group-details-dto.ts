import { GroupProps } from "../../domain/entities/group";
import { GroupDetails } from "../../domain/repositories/group-repository";

export interface GroupDetailsDto extends GroupProps {
  productsCount: number;
}

export function toGroupDetailsDto({ group, productsCount }: GroupDetails): GroupDetailsDto {
  return { ...group.toObject(), productsCount };
}
