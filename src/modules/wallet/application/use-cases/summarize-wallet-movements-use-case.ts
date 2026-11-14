import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  WALLET_REPOSITORY,
  WalletMovementsSummary,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";
import { ListWalletMovementsDto } from "../dtos/list-wallet-movements-dto";

@injectable()
export class SummarizeWalletMovementsUseCase {
  constructor(
    @inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(
    walletId: string,
    input: ListWalletMovementsDto,
    context: TenantContext,
  ): Promise<WalletMovementsSummary> {
    if (!(await this.walletRepository.findById(walletId, context.companyId))) {
      throw new ResourceNotFoundError("Carteira não encontrada.");
    }

    return this.walletRepository.summarizeMovements({
      walletId,
      companyId: context.companyId,
      search: input.search?.trim() || undefined,
      type: input.type,
      direction: input.direction,
      createdFrom: input.createdFrom,
      createdTo: input.createdTo,
    });
  }
}
