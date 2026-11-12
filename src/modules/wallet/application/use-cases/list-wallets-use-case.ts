import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  WALLET_REPOSITORY,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";
import { ListWalletsDto } from "../dtos/list-wallets-dto";
import { toWalletListItemDto, WalletListItemDto } from "../dtos/wallet-details-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListWalletsUseCase {
  constructor(
    @inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(
    input: ListWalletsDto,
    context: TenantContext,
  ): Promise<PaginatedDto<WalletListItemDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.walletRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      userCompanyId: input.userCompanyId,
      balance: input.balance,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.wallets.map(toWalletListItemDto),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
