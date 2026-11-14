export const WALLET_MOVEMENT_TYPES = [
  "INITIAL_BALANCE",
  "ADJUSTMENT",
  "ACTION_DEBIT",
  "ACTION_REFUND",
] as const;

export type WalletMovementType = (typeof WALLET_MOVEMENT_TYPES)[number];

export const WALLET_MOVEMENT_DIRECTIONS = ["credit", "debit"] as const;

export type WalletMovementDirection = (typeof WALLET_MOVEMENT_DIRECTIONS)[number];

export interface WalletMovementProps {
  id: string;
  sequence: number;
  walletId: string;
  companyId: string;
  type: WalletMovementType;
  amount: number;
  balanceAfter: number;
  reason: string | null;
  commercialActionId: string | null;
  createdAt: Date;
  createdById: string | null;
}
