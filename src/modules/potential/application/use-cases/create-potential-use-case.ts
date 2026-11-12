import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ConflictError } from "../../../../shared/errors/app-error";
import { Potential, PotentialProps } from "../../domain/entities/potential";
import {
  POTENTIAL_REPOSITORY,
  PotentialRepository,
} from "../../domain/repositories/potential-repository";
import { CreatePotentialDto } from "../dtos/create-potential-dto";

@injectable()
export class CreatePotentialUseCase {
  constructor(
    @inject(POTENTIAL_REPOSITORY)
    private readonly potentialRepository: PotentialRepository,
  ) {}

  async execute(
    input: CreatePotentialDto,
    context: TenantContext,
  ): Promise<PotentialProps> {
    const potential = Potential.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    if (await this.potentialRepository.findByName(potential.name, context.companyId)) {
      throw new ConflictError("Já existe um potencial com este nome.");
    }

    const createdPotential = await this.potentialRepository.create(potential);

    return createdPotential.toObject();
  }
}
