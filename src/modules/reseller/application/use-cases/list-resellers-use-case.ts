import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  RESELLER_REPOSITORY,
  ResellerRepository,
} from "../../domain/repositories/reseller-repository";
import { ListResellersDto } from "../dtos/list-resellers-dto";
import { ResellerDetailsDto, toResellerDetailsDto } from "../dtos/reseller-details-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListResellersUseCase {
  constructor(
    @inject(RESELLER_REPOSITORY)
    private readonly resellerRepository: ResellerRepository,
  ) {}

  async execute(
    input: ListResellersDto,
    context: TenantContext,
  ): Promise<PaginatedDto<ResellerDetailsDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.resellerRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      createdFrom: input.createdFrom,
      createdTo: input.createdTo,
      missing: input.missing,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.resellers.map(toResellerDetailsDto),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
