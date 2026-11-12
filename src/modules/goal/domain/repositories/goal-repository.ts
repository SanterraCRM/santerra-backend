import { Goal } from "../entities/goal";
import { GoalMetric } from "../entities/goal-metric";

export const GOAL_REPOSITORY = "GoalRepository";

export const GOAL_STATUSES = ["current", "upcoming", "finished"] as const;

export type GoalStatus = (typeof GOAL_STATUSES)[number];

export interface GoalFilters {
  companyId: string;
  today: Date;
  search?: string;
  employeeId?: string;
  metric?: GoalMetric;
  status?: GoalStatus;
  periodFrom?: Date;
  periodTo?: Date;
}

export interface FindGoalsParams extends GoalFilters {
  page: number;
  limit: number;
  includeDeleted: boolean;
}

export interface GoalRelation {
  id: string;
  name: string;
}

export interface GoalDetails {
  goal: Goal;
  employee: GoalRelation;
  achieved: number;
}

export interface FindGoalsResult {
  goals: GoalDetails[];
  total: number;
}

export interface GoalMetricSummary {
  metric: GoalMetric;
  goalsCount: number;
  targetValue: number;
  achieved: number;
}

export interface GoalRepository {
  create(goal: Goal): Promise<GoalDetails>;
  findById(id: string, companyId: string): Promise<Goal | null>;
  findDetailsById(id: string, companyId: string): Promise<GoalDetails | null>;
  findMany(params: FindGoalsParams): Promise<FindGoalsResult>;
  summarize(filters: GoalFilters): Promise<GoalMetricSummary[]>;
  update(goal: Goal): Promise<GoalDetails>;
  delete(goal: Goal): Promise<void>;
}
