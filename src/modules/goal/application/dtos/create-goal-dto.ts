import { GoalMetric } from "../../domain/entities/goal-metric";

export interface CreateGoalDto {
  employeeId: string;
  metric: GoalMetric;
  targetValue: number;
  achievedValue?: number | null;
  startDate: Date;
  endDate: Date;
  description?: string | null;
}
