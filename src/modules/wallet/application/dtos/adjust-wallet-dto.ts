import { WalletMovementDirection } from "../../domain/entities/wallet-movement";

export interface AdjustWalletDto {
  direction: WalletMovementDirection;
  amount: number;
  reason: string;
}
