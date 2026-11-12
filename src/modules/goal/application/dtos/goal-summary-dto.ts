import { GoalMetricSummary } from "../../domain/repositories/goal-repository";

export interface GoalSummaryDto {
  byMetric: GoalMetricSummary[];
}
