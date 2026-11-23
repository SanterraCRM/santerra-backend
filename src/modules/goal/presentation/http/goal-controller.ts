import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateGoalUseCase } from "../../application/use-cases/create-goal-use-case";
import { DeleteGoalUseCase } from "../../application/use-cases/delete-goal-use-case";
import { GetGoalUseCase } from "../../application/use-cases/get-goal-use-case";
import { ListGoalsUseCase } from "../../application/use-cases/list-goals-use-case";
import { SummarizeGoalsUseCase } from "../../application/use-cases/summarize-goals-use-case";
import { UpdateGoalUseCase } from "../../application/use-cases/update-goal-use-case";
import {
  createGoalSchema,
  listGoalsQuerySchema,
  summarizeGoalsQuerySchema,
  updateGoalSchema,
} from "./goal-schemas";

@injectable()
export class GoalController {
  constructor(
    private readonly createGoalUseCase: CreateGoalUseCase,
    private readonly listGoalsUseCase: ListGoalsUseCase,
    private readonly summarizeGoalsUseCase: SummarizeGoalsUseCase,
    private readonly getGoalUseCase: GetGoalUseCase,
    private readonly updateGoalUseCase: UpdateGoalUseCase,
    private readonly deleteGoalUseCase: DeleteGoalUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const goal = await this.createGoalUseCase.execute(
      createGoalSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(goal);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listGoalsUseCase.execute(
      listGoalsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  summary: RequestHandler = async (request, response) => {
    const summary = await this.summarizeGoalsUseCase.execute(
      summarizeGoalsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(summary);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const goal = await this.getGoalUseCase.execute(id, getTenantContext(request));

    response.status(200).json(goal);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const goal = await this.updateGoalUseCase.execute(
      id,
      updateGoalSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(goal);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteGoalUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
