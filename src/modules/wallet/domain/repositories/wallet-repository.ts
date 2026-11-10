import { Wallet } from "../entities/wallet";

export const WALLET_REPOSITORY = "WalletRepository";

export const WALLET_BALANCES = ["empty", "positive"] as const;

export type WalletBalance = (typeof WALLET_BALANCES)[number];

export interface FindWalletsParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  userCompanyId?: string;
  balance?: WalletBalance;
  includeDeleted: boolean;
}

export interface WalletMember {
  id: string;
  name: string;
  email: string;
}

export interface WalletDetails {
  wallet: Wallet;
  member: WalletMember;
}

export interface WalletListItem extends WalletDetails {
  actionsCount: number;
}

export interface FindWalletsResult {
  wallets: WalletListItem[];
  total: number;
}

export interface WalletRepository {
  create(wallet: Wallet): Promise<WalletDetails>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Wallet | null>;
  findDetailsById(id: string, companyId: string): Promise<WalletDetails | null>;
  findByUserCompanyId(userCompanyId: string, companyId: string): Promise<Wallet | null>;
  findMany(params: FindWalletsParams): Promise<FindWalletsResult>;
  countActions(id: string, companyId: string): Promise<number>;
  credit(id: string, companyId: string, amount: number, updatedById: string): Promise<boolean>;
  update(wallet: Wallet): Promise<WalletDetails>;
  delete(wallet: Wallet): Promise<void>;
}
