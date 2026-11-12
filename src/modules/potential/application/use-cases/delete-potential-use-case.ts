import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ResourceInUseError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import {
  POTENTIAL_REPOSITORY,
  PotentialRepository,
} from "../../domain/repositories/potential-repository";

@injectable()
export class DeletePotentialUseCase {
  constructor(
    @inject(POTENTIAL_REPOSITORY)
    private readonly potentialRepository: PotentialRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const potential = await this.potentialRepository.findById(id, context.companyId);

    if (!potential) {
      throw new ResourceNotFoundError("Potencial não encontrado.");
    }

    const producersCount = await this.potentialRepository.countProducers(
      potential.id,
      context.companyId,
    );

    if (producersCount > 0) {
      const producers =
        producersCount === 1 ? "1 produtor" : `${producersCount} produtores`;

      throw new ResourceInUseError(`Este potencial está em uso por ${producers}.`);
    }

    potential.delete(context.userId);
    await this.potentialRepository.delete(potential);
  }
}
