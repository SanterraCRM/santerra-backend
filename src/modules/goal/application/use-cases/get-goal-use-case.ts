import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { GOAL_REPOSITORY, GoalRepository } from "../../domain/repositories/goal-repository";
import { GoalDetailsDto, toGoalDetailsDto } from "../dtos/goal-details-dto";

@injectable()
export class GetGoalUseCase {
  constructor(
    @inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<GoalDetailsDto> {
    const goal = await this.goalRepository.findDetailsById(id, context.companyId);

    if (!goal) {
      throw new ResourceNotFoundError("Meta não encontrada.");
    }

    return toGoalDetailsDto(goal);
  }
}
