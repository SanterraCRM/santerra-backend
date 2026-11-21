import {
  WalletMovementDirection,
  WalletMovementType,
} from "../../domain/entities/wallet-movement";

export interface ListWalletMovementsDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: WalletMovementType;
  direction?: WalletMovementDirection;
  createdFrom?: Date;
  createdTo?: Date;
}
