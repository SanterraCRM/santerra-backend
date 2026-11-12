import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ConflictError, ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { MEMBER_REPOSITORY, MemberRepository } from "../../../member";
import { Wallet } from "../../domain/entities/wallet";
import {
  WALLET_REPOSITORY,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";
import { CreateWalletDto } from "../dtos/create-wallet-dto";
import { toWalletDetailsDto, WalletDetailsDto } from "../dtos/wallet-details-dto";

export const MEMBER_HAS_WALLET_MESSAGE = "Este membro já tem uma carteira.";

@injectable()
export class CreateWalletUseCase {
  constructor(
    @inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute(
    input: CreateWalletDto,
    context: TenantContext,
  ): Promise<WalletDetailsDto> {
    const wallet = Wallet.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    if (!(await this.memberRepository.findById(wallet.userCompanyId, context.companyId))) {
      throw new ResourceNotFoundError("Membro não encontrado.");
    }

    if (await this.walletRepository.findByUserCompanyId(wallet.userCompanyId, context.companyId)) {
      throw new ConflictError(MEMBER_HAS_WALLET_MESSAGE);
    }

    const createdWallet = await this.walletRepository.create(wallet);

    return toWalletDetailsDto(createdWallet);
  }
}
