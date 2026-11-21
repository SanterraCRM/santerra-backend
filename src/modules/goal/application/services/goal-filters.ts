import { startOfLocalDate } from "../../../../shared/domain/local-date";
import { GoalFilters } from "../../domain/repositories/goal-repository";
import { GoalFiltersDto } from "../dtos/list-goals-dto";

export function toGoalFilters(input: GoalFiltersDto, companyId: string, now: Date): GoalFilters {
  return {
    companyId,
    today: startOfLocalDate(now),
    search: input.search?.trim() || undefined,
    employeeId: input.employeeId,
    metric: input.metric,
    status: input.status,
    periodFrom: input.periodFrom,
    periodTo: input.periodTo,
  };
}
