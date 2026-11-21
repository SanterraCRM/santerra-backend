import { ListSort } from "../../../../shared/domain/list-sort";

export interface ListMembersDto {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  roleId?: string;
  hasWallet?: boolean;
  sort?: ListSort;
  includeDeleted?: boolean;
}
