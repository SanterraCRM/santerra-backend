import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ConflictError, ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { MEMBER_REPOSITORY, MemberRepository } from "../../../member";
import {
  WALLET_REPOSITORY,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";
import { UpdateWalletDto } from "../dtos/update-wallet-dto";
import { toWalletDetailsDto, WalletDetailsDto } from "../dtos/wallet-details-dto";
import { MEMBER_HAS_WALLET_MESSAGE } from "./create-wallet-use-case";

@injectable()
export class UpdateWalletUseCase {
  constructor(
    @inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateWalletDto,
    context: TenantContext,
  ): Promise<WalletDetailsDto> {
    const wallet = await this.walletRepository.findById(id, context.companyId);

    if (!wallet) {
      throw new ResourceNotFoundError("Carteira não encontrada.");
    }

    const previousUserCompanyId = wallet.userCompanyId;
    wallet.update({ ...input, updatedById: context.userId });

    if (wallet.userCompanyId !== previousUserCompanyId) {
      if (!(await this.memberRepository.findById(wallet.userCompanyId, context.companyId))) {
        throw new ResourceNotFoundError("Membro não encontrado.");
      }

      if (await this.walletRepository.findByUserCompanyId(wallet.userCompanyId, context.companyId)) {
        throw new ConflictError(MEMBER_HAS_WALLET_MESSAGE);
      }
    }

    const updatedWallet = await this.walletRepository.update(wallet);

    return toWalletDetailsDto(updatedWallet);
  }
}
