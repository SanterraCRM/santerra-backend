import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

export const WALLET_MAX_VALUE = 999_999_999_999.99;

export interface WalletProps {
  id: string;
  value: number;
  userCompanyId: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateWalletProps {
  value?: number;
  userCompanyId: string;
  companyId: string;
  createdById?: string | null;
}

export interface UpdateWalletProps {
  userCompanyId?: string;
  updatedById?: string | null;
}

export class Wallet {
  private constructor(private readonly props: WalletProps) {}

  static create(
    input: CreateWalletProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Wallet {
    const value = Wallet.normalizeValue(input.value ?? 0);
    const userCompanyId = Wallet.normalizeUserCompanyId(input.userCompanyId);

    return new Wallet({
      id,
      value,
      userCompanyId,
      companyId: input.companyId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: WalletProps): Wallet {
    return new Wallet({ ...props });
  }

  get userCompanyId(): string {
    return this.props.userCompanyId;
  }

  update(input: UpdateWalletProps, updatedAt = new Date()): void {
    if (input.userCompanyId !== undefined) {
      this.props.userCompanyId = Wallet.normalizeUserCompanyId(input.userCompanyId);
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): WalletProps {
    return { ...this.props };
  }

  private static normalizeValue(value: number): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new DomainError("O valor da carteira deve ser um número.");
    }

    if (value < 0) {
      throw new DomainError("O valor da carteira não pode ser negativo.");
    }

    if (value > WALLET_MAX_VALUE) {
      throw new DomainError("O valor da carteira excede o máximo permitido.");
    }

    return value;
  }

  private static normalizeUserCompanyId(userCompanyId?: string): string {
    if (typeof userCompanyId !== "string" || userCompanyId.trim().length === 0) {
      throw new DomainError("O ID do membro é obrigatório.");
    }

    return userCompanyId.trim();
  }
}
