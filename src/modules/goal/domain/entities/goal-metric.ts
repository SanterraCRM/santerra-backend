export enum GoalMetric {
  COMPLETED_TRIPS = "COMPLETED_TRIPS",
  VISITED_PRODUCERS = "VISITED_PRODUCERS",
  COMMERCIAL_ACTIONS = "COMMERCIAL_ACTIONS",
  SALES = "SALES",
}

export const GOAL_METRICS: GoalMetric[] = Object.values(GoalMetric);

export function isCountMetric(metric: GoalMetric): boolean {
  return metric !== GoalMetric.SALES;
}
