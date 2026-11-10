import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  HARVEST_REPOSITORY,
  HarvestRepository,
} from "../../domain/repositories/harvest-repository";
import { HarvestDetailsDto, toHarvestDetailsDto } from "../dtos/harvest-details-dto";

@injectable()
export class GetHarvestUseCase {
  constructor(
    @inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: HarvestRepository,
  ) {}

  async execute(id: string): Promise<HarvestDetailsDto> {
    const harvest = await this.harvestRepository.findDetailsById(id);

    if (!harvest) {
      throw new ResourceNotFoundError("Cultura não encontrada.");
    }

    return toHarvestDetailsDto(harvest);
  }
}
