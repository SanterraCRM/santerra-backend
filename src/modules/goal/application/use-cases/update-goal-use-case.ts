import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { GOAL_REPOSITORY, GoalRepository } from "../../domain/repositories/goal-repository";
import { GoalDetailsDto, toGoalDetailsDto } from "../dtos/goal-details-dto";
import { UpdateGoalDto } from "../dtos/update-goal-dto";
import { GoalReferences } from "../services/goal-references";

@injectable()
export class UpdateGoalUseCase {
  constructor(
    @inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
    private readonly goalReferences: GoalReferences,
  ) {}

  async execute(id: string, input: UpdateGoalDto, context: TenantContext): Promise<GoalDetailsDto> {
    const goal = await this.goalRepository.findById(id, context.companyId);

    if (!goal) {
      throw new ResourceNotFoundError("Meta não encontrada.");
    }

    const previousEmployeeId = goal.employeeId;
    goal.update({ ...input, updatedById: context.userId });

    if (goal.employeeId !== previousEmployeeId) {
      await this.goalReferences.ensureActiveEmployee(goal.employeeId, context.companyId);
    }

    return toGoalDetailsDto(await this.goalRepository.update(goal));
  }
}
