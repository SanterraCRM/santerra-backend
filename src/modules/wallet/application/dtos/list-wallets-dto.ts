import { WalletBalance } from "../../domain/repositories/wallet-repository";

export interface ListWalletsDto {
  page?: number;
  limit?: number;
  search?: string;
  userCompanyId?: string;
  balance?: WalletBalance;
  includeDeleted?: boolean;
}
