import { inject, injectable } from "tsyringe";

import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  PRODUCT_VIEW_REPOSITORY,
  ProductViewRepository,
} from "../../domain/repositories/productView-repository";
import { ProductViewDto } from "../dtos/productsView-dto";
import { toProductViewDto } from "../dtos/productsView-dto";
import { ListProductsViewDto } from "../dtos/list-productsView-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListProductsViewUseCase {
  constructor(
    @inject(PRODUCT_VIEW_REPOSITORY)
    private readonly productRepository: ProductViewRepository,
  ) {}

  async execute(
    input: ListProductsViewDto,
  ): Promise<PaginatedDto<ProductViewDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;
    const search = input.search?.trim() || undefined;

    const result = await this.productRepository.findMany({
      page,
      limit,
      search,
    });

    return {
      data: result.productsView.map(toProductViewDto),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}