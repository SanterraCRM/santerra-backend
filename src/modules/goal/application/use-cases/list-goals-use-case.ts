import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import { GOAL_REPOSITORY, GoalRepository } from "../../domain/repositories/goal-repository";
import { GoalDetailsDto, toGoalDetailsDto } from "../dtos/goal-details-dto";
import { ListGoalsDto } from "../dtos/list-goals-dto";
import { toGoalFilters } from "../services/goal-filters";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListGoalsUseCase {
  constructor(
    @inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(
    input: ListGoalsDto,
    context: TenantContext,
    now = new Date(),
  ): Promise<PaginatedDto<GoalDetailsDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;
    const result = await this.goalRepository.findMany({
      ...toGoalFilters(input, context.companyId, now),
      page,
      limit,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.goals.map(toGoalDetailsDto),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
