import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import {
  HARVEST_REPOSITORY,
  HarvestRepository,
} from "../../domain/repositories/harvest-repository";
import { HarvestDetailsDto, toHarvestDetailsDto } from "../dtos/harvest-details-dto";
import { UpdateHarvestDto } from "../dtos/update-harvest-dto";

@injectable()
export class UpdateHarvestUseCase {
  constructor(
    @inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: HarvestRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateHarvestDto,
    context: AuthContext,
  ): Promise<HarvestDetailsDto> {
    const harvest = await this.harvestRepository.findById(id);

    if (!harvest) {
      throw new ResourceNotFoundError("Cultura não encontrada.");
    }

    harvest.update({ ...input, updatedById: context.userId });

    if (input.name !== undefined) {
      const owner = await this.harvestRepository.findByName(harvest.name);

      if (owner && owner.id !== harvest.id) {
        throw new ConflictError("Já existe uma cultura com este nome.");
      }
    }

    const updatedHarvest = await this.harvestRepository.update(harvest);

    return toHarvestDetailsDto(updatedHarvest);
  }
}
