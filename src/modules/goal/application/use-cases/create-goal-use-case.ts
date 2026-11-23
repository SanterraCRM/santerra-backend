import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { Goal } from "../../domain/entities/goal";
import { GOAL_REPOSITORY, GoalRepository } from "../../domain/repositories/goal-repository";
import { CreateGoalDto } from "../dtos/create-goal-dto";
import { GoalDetailsDto, toGoalDetailsDto } from "../dtos/goal-details-dto";
import { GoalReferences } from "../services/goal-references";

@injectable()
export class CreateGoalUseCase {
  constructor(
    @inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
    private readonly goalReferences: GoalReferences,
  ) {}

  async execute(input: CreateGoalDto, context: TenantContext): Promise<GoalDetailsDto> {
    const goal = Goal.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    await this.goalReferences.ensureActiveEmployee(goal.employeeId, context.companyId);

    return toGoalDetailsDto(await this.goalRepository.create(goal));
  }
}
