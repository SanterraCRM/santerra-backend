import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import {
  ResourceInUseError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import {
  MANUFACTURER_REPOSITORY,
  ManufacturerRepository,
} from "../../domain/repositories/manufacturer-repository";

@injectable()
export class DeleteManufacturerUseCase {
  constructor(
    @inject(MANUFACTURER_REPOSITORY)
    private readonly manufacturerRepository: ManufacturerRepository,
  ) {}

  async execute(id: string, context: AuthContext): Promise<void> {
    const manufacturer = await this.manufacturerRepository.findById(id);

    if (!manufacturer) {
      throw new ResourceNotFoundError("Fabricante não encontrado.");
    }

    const productsCount = await this.manufacturerRepository.countProducts(manufacturer.id);

    if (productsCount > 0) {
      const products = productsCount === 1 ? "1 produto" : `${productsCount} produtos`;

      throw new ResourceInUseError(`Este fabricante está em uso por ${products}.`);
    }

    manufacturer.delete(context.userId);
    await this.manufacturerRepository.delete(manufacturer);
  }
}
