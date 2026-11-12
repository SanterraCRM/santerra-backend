import { RoleProps } from "../../domain/entities/role";

export interface RoleListItemDto extends RoleProps {
  membersCount: number;
}
