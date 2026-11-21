import { DomainError } from "../../../../shared/domain/errors/domain-error";
import { WALLET_MAX_VALUE } from "./wallet";
import { WalletMovementDirection } from "./wallet-movement";

export const WALLET_ADJUSTMENT_REASON_MAX_LENGTH = 500;

interface CreateWalletAdjustmentProps {
  direction: WalletMovementDirection;
  amount: number;
  reason: string;
}

export class WalletAdjustment {
  private constructor(
    readonly amount: number,
    readonly reason: string,
  ) {}

  static create({ direction, amount, reason }: CreateWalletAdjustmentProps): WalletAdjustment {
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      throw new DomainError("Informe um valor maior que zero.");
    }

    if (amount > WALLET_MAX_VALUE) {
      throw new DomainError("O valor excede o máximo permitido.");
    }

    const normalizedReason = typeof reason === "string" ? reason.trim() : "";

    if (normalizedReason.length === 0) {
      throw new DomainError("Informe o motivo do ajuste.");
    }

    if (normalizedReason.length > WALLET_ADJUSTMENT_REASON_MAX_LENGTH) {
      throw new DomainError(
        `O motivo pode ter até ${WALLET_ADJUSTMENT_REASON_MAX_LENGTH} caracteres.`,
      );
    }

    return new WalletAdjustment(direction === "debit" ? -amount : amount, normalizedReason);
  }
}
