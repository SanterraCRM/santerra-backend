import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { GOAL_REPOSITORY, GoalRepository } from "../../domain/repositories/goal-repository";
import { GoalSummaryDto } from "../dtos/goal-summary-dto";
import { GoalFiltersDto } from "../dtos/list-goals-dto";
import { toGoalFilters } from "../services/goal-filters";

@injectable()
export class SummarizeGoalsUseCase {
  constructor(
    @inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(
    input: GoalFiltersDto,
    context: TenantContext,
    now = new Date(),
  ): Promise<GoalSummaryDto> {
    return {
      byMetric: await this.goalRepository.summarize(toGoalFilters(input, context.companyId, now)),
    };
  }
}
