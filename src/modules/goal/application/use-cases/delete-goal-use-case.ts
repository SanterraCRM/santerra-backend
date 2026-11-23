import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { GOAL_REPOSITORY, GoalRepository } from "../../domain/repositories/goal-repository";

@injectable()
export class DeleteGoalUseCase {
  constructor(
    @inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const goal = await this.goalRepository.findById(id, context.companyId);

    if (!goal) {
      throw new ResourceNotFoundError("Meta não encontrada.");
    }

    goal.delete(context.userId);
    await this.goalRepository.delete(goal);
  }
}
