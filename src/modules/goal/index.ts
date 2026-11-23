import "./goal-container";

export { Goal } from "./domain/entities/goal";
export { GOAL_REPOSITORY } from "./domain/repositories/goal-repository";
export type { GoalRepository } from "./domain/repositories/goal-repository";
export { goalRouter } from "./presentation/http/goal-routes";
