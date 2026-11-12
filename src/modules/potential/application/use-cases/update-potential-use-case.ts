import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PotentialProps } from "../../domain/entities/potential";
import {
  POTENTIAL_REPOSITORY,
  PotentialRepository,
} from "../../domain/repositories/potential-repository";
import { UpdatePotentialDto } from "../dtos/update-potential-dto";

@injectable()
export class UpdatePotentialUseCase {
  constructor(
    @inject(POTENTIAL_REPOSITORY)
    private readonly potentialRepository: PotentialRepository,
  ) {}

  async execute(
    id: string,
    input: UpdatePotentialDto,
    context: TenantContext,
  ): Promise<PotentialProps> {
    const potential = await this.potentialRepository.findById(id, context.companyId);

    if (!potential) {
      throw new ResourceNotFoundError("Potencial não encontrado.");
    }

    potential.update({ ...input, updatedById: context.userId });

    if (input.name !== undefined) {
      const owner = await this.potentialRepository.findByName(
        potential.name,
        context.companyId,
      );

      if (owner && owner.id !== potential.id) {
        throw new ConflictError("Já existe um potencial com este nome.");
      }
    }

    const updatedPotential = await this.potentialRepository.update(potential);

    return updatedPotential.toObject();
  }
}
