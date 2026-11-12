import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceInUseError, ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  WALLET_REPOSITORY,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";

@injectable()
export class DeleteWalletUseCase {
  constructor(
    @inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const wallet = await this.walletRepository.findById(id, context.companyId);

    if (!wallet) {
      throw new ResourceNotFoundError("Carteira não encontrada.");
    }

    const actionsCount = await this.walletRepository.countActions(id, context.companyId);

    if (actionsCount > 0) {
      const actions = actionsCount === 1 ? "1 ação comercial" : `${actionsCount} ações comerciais`;

      throw new ResourceInUseError(`Esta carteira está em uso por ${actions}.`);
    }

    wallet.delete(context.userId);
    await this.walletRepository.delete(wallet);
  }
}
