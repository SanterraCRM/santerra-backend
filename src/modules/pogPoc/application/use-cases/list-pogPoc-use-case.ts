import { inject, injectable } from "tsyringe";

import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import { POG_POC_GATEWAY, PogPocGateway } from "../../domain/gateways/pogPoc-gateway";
import { ListPogPocsDto } from "../dtos/list-pogPoc-dto";
import { PogPocDto, toPogPocDto } from "../dtos/pogPoc-dto";
import { PogPocResellers } from "../services/pogPoc-resellers";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListPogPocsUseCase {
  constructor(
    @inject(POG_POC_GATEWAY)
    private readonly pogPocGateway: PogPocGateway,
    private readonly pogPocResellers: PogPocResellers,
  ) {}

  async execute({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    search,
    ...filters
  }: ListPogPocsDto): Promise<PaginatedDto<PogPocDto>> {
    const result = await this.pogPocGateway.findMany({
      ...filters,
      page,
      limit,
      search: search?.trim() || undefined,
    });

    const resellers = await this.pogPocResellers.findByDocument(result.pogPocs);

    return {
      data: result.pogPocs.map((pogPoc) => toPogPocDto(pogPoc, resellers)),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
