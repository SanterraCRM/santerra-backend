import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  WALLET_REPOSITORY,
  WalletRepository,
} from "../../domain/repositories/wallet-repository";
import { ListWalletMovementsDto } from "../dtos/list-wallet-movements-dto";
import { toWalletMovementDto, WalletMovementDto } from "../dtos/wallet-movement-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListWalletMovementsUseCase {
  constructor(
    @inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(
    walletId: string,
    input: ListWalletMovementsDto,
    context: TenantContext,
  ): Promise<PaginatedDto<WalletMovementDto>> {
    if (!(await this.walletRepository.findById(walletId, context.companyId))) {
      throw new ResourceNotFoundError("Carteira não encontrada.");
    }

    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;
    const result = await this.walletRepository.findMovements({
      walletId,
      companyId: context.companyId,
      page,
      limit,
      search: input.search?.trim() || undefined,
      type: input.type,
      direction: input.direction,
      createdFrom: input.createdFrom,
      createdTo: input.createdTo,
    });

    return {
      data: result.movements.map((movement) => toWalletMovementDto(movement, context)),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
