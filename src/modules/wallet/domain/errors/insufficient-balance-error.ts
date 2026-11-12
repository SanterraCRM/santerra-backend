import { DomainError } from "../../../../shared/domain/errors/domain-error";

export class InsufficientBalanceError extends DomainError {
  constructor() {
    super("Saldo insuficiente na carteira.", "INSUFFICIENT_BALANCE");
  }
}
