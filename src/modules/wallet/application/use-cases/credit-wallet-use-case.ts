import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { DomainError } from "../../../../shared/domain/errors/domain-error";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { Wallet } from "../../domain/entities/wallet";
import {
  WALLET_REPOSITORY,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";
import { CreditWalletDto } from "../dtos/credit-wallet-dto";
import { toWalletDetailsDto, WalletDetailsDto } from "../dtos/wallet-details-dto";

@injectable()
export class CreditWalletUseCase {
  constructor(
    @inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(
    id: string,
    input: CreditWalletDto,
    context: TenantContext,
  ): Promise<WalletDetailsDto> {
    const amount = Wallet.ensureCreditAmount(input.amount);

    if (!(await this.walletRepository.findById(id, context.companyId))) {
      throw new ResourceNotFoundError("Carteira não encontrada.");
    }

    if (!(await this.walletRepository.credit(id, context.companyId, amount, context.userId))) {
      throw new DomainError("Com este crédito, o saldo passaria do máximo permitido.");
    }

    const wallet = await this.walletRepository.findDetailsById(id, context.companyId);

    if (!wallet) {
      throw new ResourceNotFoundError("Carteira não encontrada.");
    }

    return toWalletDetailsDto(wallet);
  }
}
