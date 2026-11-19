import { inject, injectable } from "tsyringe";

import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  PRODUCT_VIEW_REPOSITORY,
  ProductViewRepository,
} from "../../domain/repositories/productView-repository";
import { ListProductsViewDto } from "../dtos/list-productsView-dto";
import { ProductViewDto, toProductViewDto } from "../dtos/productsView-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListProductsViewUseCase {
  constructor(
    @inject(PRODUCT_VIEW_REPOSITORY)
    private readonly productRepository: ProductViewRepository,
  ) {}

  async execute({
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    search,
    ...filters
  }: ListProductsViewDto): Promise<PaginatedDto<ProductViewDto>> {
    const result = await this.productRepository.findMany({
      ...filters,
      page,
      limit,
      search: search?.trim() || undefined,
    });

    const productIds = result.productsView
      .map((product) => product.id)
      .filter((id): id is number => id !== null);
    const crops = await this.productRepository.findCropsByProductIds(productIds);

    return {
      data: result.productsView.map((product) =>
        toProductViewDto(product, product.id === null ? [] : crops.get(product.id)),
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
