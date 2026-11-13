import { ListSort } from "../../../../shared/domain/list-sort";
import { WalletBalance } from "../../domain/repositories/wallet-repository";

export interface ListWalletsDto {
  page?: number;
  limit?: number;
  search?: string;
  userCompanyId?: string;
  balance?: WalletBalance;
  sort?: ListSort;
  includeDeleted?: boolean;
}
