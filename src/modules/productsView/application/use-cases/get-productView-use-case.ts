import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  PRODUCT_VIEW_REPOSITORY,
  ProductViewRepository,
} from "../../domain/repositories/productView-repository";
import { ProductViewDto, toProductViewDto } from "../dtos/productsView-dto";

@injectable()
export class GetProductViewUseCase {
  constructor(
    @inject(PRODUCT_VIEW_REPOSITORY)
    private readonly productRepository: ProductViewRepository,
  ) {}

  async execute(id: number): Promise<ProductViewDto> {
    const [product, crops] = await Promise.all([
      this.productRepository.findById(id),
      this.productRepository.findCropsByProductIds([id]),
    ]);

    if (!product) {
      throw new ResourceNotFoundError("Produto não encontrado.");
    }

    return toProductViewDto(product, crops.get(id));
  }
}
