import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from "../../domain/repositories/product-repository";
import { ProductDetailsDto, toProductDetailsDto } from "../dtos/product-details-dto";

@injectable()
export class GetProductUseCase {
  constructor(
    @inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<ProductDetailsDto> {
    const product = await this.productRepository.findDetailsById(id, context.companyId);

    if (!product) {
      throw new ResourceNotFoundError("Produto não encontrado.");
    }

    return toProductDetailsDto(product, context);
  }
}
