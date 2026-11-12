import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import { ConflictError } from "../../../../shared/errors/app-error";
import { Harvest } from "../../domain/entities/harvest";
import {
  HARVEST_REPOSITORY,
  HarvestRepository,
} from "../../domain/repositories/harvest-repository";
import { CreateHarvestDto } from "../dtos/create-harvest-dto";
import { HarvestDetailsDto, toHarvestDetailsDto } from "../dtos/harvest-details-dto";

@injectable()
export class CreateHarvestUseCase {
  constructor(
    @inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: HarvestRepository,
  ) {}

  async execute(input: CreateHarvestDto, context: AuthContext): Promise<HarvestDetailsDto> {
    const harvest = Harvest.create({ ...input, createdById: context.userId });

    if (await this.harvestRepository.findByName(harvest.name)) {
      throw new ConflictError("Já existe uma cultura com este nome.");
    }

    const createdHarvest = await this.harvestRepository.create(harvest);

    return toHarvestDetailsDto(createdHarvest);
  }
}
