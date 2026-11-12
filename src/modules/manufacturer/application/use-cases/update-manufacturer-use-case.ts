import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PublicManufacturerProps } from "../../domain/entities/manufacturer";
import {
  MANUFACTURER_REPOSITORY,
  ManufacturerRepository,
} from "../../domain/repositories/manufacturer-repository";
import { UpdateManufacturerDto } from "../dtos/update-manufacturer-dto";

@injectable()
export class UpdateManufacturerUseCase {
  constructor(
    @inject(MANUFACTURER_REPOSITORY)
    private readonly manufacturerRepository: ManufacturerRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateManufacturerDto,
    context: AuthContext,
  ): Promise<PublicManufacturerProps> {
    const manufacturer = await this.manufacturerRepository.findById(id);

    if (!manufacturer) {
      throw new ResourceNotFoundError("Fabricante não encontrado.");
    }

    manufacturer.update({ ...input, updatedById: context.userId });

    if (input.name !== undefined) {
      const owner = await this.manufacturerRepository.findByName(manufacturer.name);

      if (owner && owner.id !== manufacturer.id) {
        throw new ConflictError("Já existe um fabricante com este nome.");
      }
    }

    const updatedManufacturer = await this.manufacturerRepository.update(manufacturer);

    return updatedManufacturer.toPublicObject();
  }
}
