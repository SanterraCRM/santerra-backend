import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  WALLET_REPOSITORY,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";
import { toWalletDetailsDto, WalletDetailsDto } from "../dtos/wallet-details-dto";

@injectable()
export class GetWalletUseCase {
  constructor(
    @inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<WalletDetailsDto> {
    const wallet = await this.walletRepository.findDetailsById(id, context.companyId);

    if (!wallet) {
      throw new ResourceNotFoundError("Carteira não encontrada.");
    }

    return toWalletDetailsDto(wallet);
  }
}
