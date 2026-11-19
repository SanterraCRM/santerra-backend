import { inject, injectable } from "tsyringe";

import {
  PRODUCT_VIEW_REPOSITORY,
  ProductViewRepository,
} from "../../domain/repositories/productView-repository";
import { ProductViewFilterOptionsDto } from "../dtos/productsView-dto";

@injectable()
export class GetProductViewFilterOptionsUseCase {
  constructor(
    @inject(PRODUCT_VIEW_REPOSITORY)
    private readonly productRepository: ProductViewRepository,
  ) {}

  execute(): Promise<ProductViewFilterOptionsDto> {
    return this.productRepository.findFilterOptions();
  }
}
