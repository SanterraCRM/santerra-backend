import { GoalMetric } from "../../domain/entities/goal-metric";
import { GoalStatus } from "../../domain/repositories/goal-repository";

export interface GoalFiltersDto {
  search?: string;
  employeeId?: string;
  metric?: GoalMetric;
  status?: GoalStatus;
  periodFrom?: Date;
  periodTo?: Date;
}

export interface ListGoalsDto extends GoalFiltersDto {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}
