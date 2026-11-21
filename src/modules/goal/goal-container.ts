import { container } from "tsyringe";

import { GOAL_REPOSITORY, GoalRepository } from "./domain/repositories/goal-repository";
import { PrismaGoalRepository } from "./infrastructure/prisma/prisma-goal-repository";

container.registerSingleton<GoalRepository>(GOAL_REPOSITORY, PrismaGoalRepository);
