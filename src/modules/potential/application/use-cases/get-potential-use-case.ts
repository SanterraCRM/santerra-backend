import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { PotentialProps } from "../../domain/entities/potential";
import {
  POTENTIAL_REPOSITORY,
  PotentialRepository,
} from "../../domain/repositories/potential-repository";

@injectable()
export class GetPotentialUseCase {
  constructor(
    @inject(POTENTIAL_REPOSITORY)
    private readonly potentialRepository: PotentialRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<PotentialProps> {
    const potential = await this.potentialRepository.findById(id, context.companyId);

    if (!potential) {
      throw new ResourceNotFoundError("Potencial não encontrado.");
    }

    return potential.toObject();
  }
}
