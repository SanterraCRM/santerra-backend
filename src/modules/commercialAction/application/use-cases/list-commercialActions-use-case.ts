import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  COMMERCIAL_ACTION_REPOSITORY,
  CommercialActionRepository,
} from "../../domain/repositories/commercialAction-repository";
import {
  CommercialActionDetailsDto,
  toCommercialActionDetailsDto,
} from "../dtos/commercialAction-details-dto";
import { ListCommercialActionsDto } from "../dtos/list-commercialActions-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListCommercialActionsUseCase {
  constructor(
    @inject(COMMERCIAL_ACTION_REPOSITORY)
    private readonly commercialActionRepository: CommercialActionRepository,
  ) {}

  async execute(
    input: ListCommercialActionsDto,
    context: TenantContext,
  ): Promise<PaginatedDto<CommercialActionDetailsDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.commercialActionRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      eventId: input.eventId,
      responsibleId: input.responsibleId,
      walletId: input.walletId,
      initialFrom: input.initialFrom,
      initialTo: input.initialTo,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.commercialActions.map((details) =>
        toCommercialActionDetailsDto(details, context),
      ),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
