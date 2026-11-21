import { inject, injectable } from "tsyringe";

import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  RESELLER_VIEW_REPOSITORY,
  ResellerViewRepository,
} from "../../domain/repositories/resellerView-repository";
import { ListResellersViewDto } from "../dtos/list-resellersView-dto";
import { ResellerViewDto, toResellerViewDto } from "../dtos/resellersView-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListResellersViewUseCase {
  constructor(
    @inject(RESELLER_VIEW_REPOSITORY)
    private readonly resellerRepository: ResellerViewRepository,
  ) {}

  async execute({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    search,
    ...filters
  }: ListResellersViewDto): Promise<PaginatedDto<ResellerViewDto>> {
    const result = await this.resellerRepository.findMany({
      ...filters,
      page,
      limit,
      search: search?.trim() || undefined,
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
