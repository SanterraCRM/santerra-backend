import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { DomainError } from "../../../../shared/domain/errors/domain-error";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { WalletAdjustment } from "../../domain/entities/wallet-adjustment";
import { InsufficientBalanceError } from "../../domain/errors/insufficient-balance-error";
import {
  WALLET_REPOSITORY,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";
import { AdjustWalletDto } from "../dtos/adjust-wallet-dto";
import { toWalletDetailsDto, WalletDetailsDto } from "../dtos/wallet-details-dto";

@injectable()
export class AdjustWalletUseCase {
  constructor(
    @inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(
    id: string,
    input: AdjustWalletDto,
    context: TenantContext,
  ): Promise<WalletDetailsDto> {
    const adjustment = WalletAdjustment.create(input);

    if (!(await this.walletRepository.findById(id, context.companyId))) {
      throw new ResourceNotFoundError("Carteira não encontrada.");
    }

    const result = await this.walletRepository.adjust({
      id,
      companyId: context.companyId,
      amount: adjustment.amount,
      reason: adjustment.reason,
      userId: context.userId,
    });

    if (result === "insufficient_balance") {
      throw new InsufficientBalanceError();
    }

    if (result === "exceeds_maximum") {
      throw new DomainError("Com este ajuste, o saldo passaria do máximo permitido.");
    }

    const wallet = await this.walletRepository.findDetailsById(id, context.companyId);

    if (!wallet) {
      throw new ResourceNotFoundError("Carteira não encontrada.");
    }

    return toWalletDetailsDto(wallet);
  }
}
