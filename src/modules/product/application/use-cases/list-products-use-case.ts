import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from "../../domain/repositories/product-repository";
import { ListProductsDto } from "../dtos/list-products-dto";
import { ProductDetailsDto, toProductDetailsDto } from "../dtos/product-details-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListProductsUseCase {
  constructor(
    @inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    input: ListProductsDto,
    context: TenantContext,
  ): Promise<PaginatedDto<ProductDetailsDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.productRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      manufacturerId: input.manufacturerId,
      groupId: input.groupId,
      priceMin: input.priceMin,
      priceMax: input.priceMax,
      createdFrom: input.createdFrom,
      createdTo: input.createdTo,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.products.map((details) => toProductDetailsDto(details, context)),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
