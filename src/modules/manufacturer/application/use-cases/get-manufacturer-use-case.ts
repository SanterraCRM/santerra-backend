import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { PublicManufacturerProps } from "../../domain/entities/manufacturer";
import {
  MANUFACTURER_REPOSITORY,
  ManufacturerRepository,
} from "../../domain/repositories/manufacturer-repository";

@injectable()
export class GetManufacturerUseCase {
  constructor(
    @inject(MANUFACTURER_REPOSITORY)
    private readonly manufacturerRepository: ManufacturerRepository,
  ) {}

  async execute(id: string): Promise<PublicManufacturerProps> {
    const manufacturer = await this.manufacturerRepository.findById(id);

    if (!manufacturer) {
      throw new ResourceNotFoundError("Fabricante não encontrado.");
    }

    return manufacturer.toPublicObject();
  }
}
