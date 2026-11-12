import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  HARVEST_REPOSITORY,
  HarvestRepository,
} from "../../domain/repositories/harvest-repository";

@injectable()
export class DeleteHarvestUseCase {
  constructor(
    @inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: HarvestRepository,
  ) {}

  async execute(id: string, context: AuthContext): Promise<void> {
    const harvest = await this.harvestRepository.findById(id);

    if (!harvest) {
      throw new ResourceNotFoundError("Cultura não encontrada.");
    }

    harvest.delete(context.userId);
    await this.harvestRepository.delete(harvest);
  }
}
