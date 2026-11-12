import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from "../../domain/repositories/product-repository";

@injectable()
export class DeleteProductUseCase {
  constructor(
    @inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const product = await this.productRepository.findById(id, context.companyId);

    if (!product) {
      throw new ResourceNotFoundError("Produto não encontrado.");
    }

    product.delete(context.userId);
    await this.productRepository.delete(product);
  }
}
