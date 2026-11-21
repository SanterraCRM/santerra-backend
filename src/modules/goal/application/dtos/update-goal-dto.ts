import { GoalMetric } from "../../domain/entities/goal-metric";

export interface UpdateGoalDto {
  employeeId?: string;
  metric?: GoalMetric;
  targetValue?: number;
  achievedValue?: number | null;
  startDate?: Date;
  endDate?: Date;
  description?: string | null;
}
