import { ListSort } from "../../../../shared/domain/list-sort";
import { Wallet } from "../entities/wallet";
import {
  WalletMovementDirection,
  WalletMovementProps,
  WalletMovementType,
} from "../entities/wallet-movement";

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
  sort?: ListSort;
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

export interface WalletMovementFilters {
  walletId: string;
  companyId: string;
  search?: string;
  type?: WalletMovementType;
  direction?: WalletMovementDirection;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface FindWalletMovementsParams extends WalletMovementFilters {
  page: number;
  limit: number;
}

export interface WalletMovementAction {
  id: string;
  description: string | null;
  deletedAt: Date | null;
  event: { id: string; name: string };
}

export interface WalletMovementDetails {
  movement: WalletMovementProps;
  createdBy: { id: string; name: string } | null;
  commercialAction: WalletMovementAction | null;
}

export interface FindWalletMovementsResult {
  movements: WalletMovementDetails[];
  total: number;
}

export interface WalletMovementsSummary {
  credits: number;
  debits: number;
  count: number;
}

export interface WalletAdjustmentInput {
  id: string;
  companyId: string;
  amount: number;
  reason: string;
  userId: string;
}

export type WalletAdjustmentResult = "applied" | "insufficient_balance" | "exceeds_maximum";

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
  adjust(input: WalletAdjustmentInput): Promise<WalletAdjustmentResult>;
  findMovements(params: FindWalletMovementsParams): Promise<FindWalletMovementsResult>;
  summarizeMovements(filters: WalletMovementFilters): Promise<WalletMovementsSummary>;
  update(wallet: Wallet): Promise<WalletDetails>;
  delete(wallet: Wallet): Promise<void>;
}
