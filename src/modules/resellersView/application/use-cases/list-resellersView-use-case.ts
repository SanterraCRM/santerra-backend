import { inject, injectable } from "tsyringe";

import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  RESELLER_VIEW_REPOSITORY,
  ResellerViewRepository,
} from "../../domain/repositories/resellerView-repository";
import { ResellerViewDto } from "../dtos/resellersView-dto";
import { toResellerViewDto } from "../dtos/resellersView-dto";
import { ListResellersViewDto } from "../dtos/list-resellersView-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListResellersViewUseCase {
  constructor(
    @inject(RESELLER_VIEW_REPOSITORY)
    private readonly resellerRepository: ResellerViewRepository,
  ) {}

  async execute(
    input: ListResellersViewDto,
  ): Promise<PaginatedDto<ResellerViewDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;
    const search = input.search?.trim() || undefined;

    const result = await this.resellerRepository.findMany({
      page,
      limit,
      search,
    });

    return {
      data: result.resellersView.map(toResellerViewDto),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}