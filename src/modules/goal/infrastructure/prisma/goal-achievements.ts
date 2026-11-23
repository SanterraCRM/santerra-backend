import { PrismaClient } from "@prisma/client";

import { addDays } from "../../../../shared/domain/local-date";
import { GoalMetric } from "../../domain/entities/goal-metric";

export interface GoalAchievementInput {
  id: string;
  employeeId: string;
  metric: GoalMetric;
  startDate: Date;
  endDate: Date;
  achievedValue: number | null;
}

interface EmployeeRange {
  employeeId: string;
  from: Date;
  to: Date;
}

interface DatedRecord {
  responsibleId: string;
  date: Date | null;
  producerId?: string;
}

const TRIP_METRICS = [GoalMetric.COMPLETED_TRIPS, GoalMetric.VISITED_PRODUCERS];

function getPeriodEnd(goal: GoalAchievementInput): Date {
  return addDays(goal.endDate, 1);
}

function toEmployeeRanges(goals: GoalAchievementInput[]): EmployeeRange[] {
  const ranges = new Map<string, EmployeeRange>();

  goals.forEach((goal) => {
    const range = ranges.get(goal.employeeId);
    const to = getPeriodEnd(goal);

    ranges.set(goal.employeeId, {
      employeeId: goal.employeeId,
      from: range && range.from < goal.startDate ? range.from : goal.startDate,
      to: range && range.to > to ? range.to : to,
    });
  });

  return [...ranges.values()];
}

function groupByEmployee(records: DatedRecord[]): Map<string, DatedRecord[]> {
  const groups = new Map<string, DatedRecord[]>();

  records.forEach((record) => {
    const group = groups.get(record.responsibleId);

    if (group) {
      group.push(record);
    } else {
      groups.set(record.responsibleId, [record]);
    }
  });

  return groups;
}

function inPeriod(goal: GoalAchievementInput, records: DatedRecord[] = []): DatedRecord[] {
  const end = getPeriodEnd(goal);

  return records.filter(({ date }) => date !== null && date >= goal.startDate && date < end);
}

export async function computeGoalAchievements(
  prisma: PrismaClient,
  companyId: string,
  goals: GoalAchievementInput[],
): Promise<Map<string, number>> {
  const tripGoals = goals.filter((goal) => TRIP_METRICS.includes(goal.metric));
  const actionGoals = goals.filter((goal) => goal.metric === GoalMetric.COMMERCIAL_ACTIONS);

  const [trips, actions] = await Promise.all([
    tripGoals.length > 0
      ? prisma.commercialTrip.findMany({
          where: {
            companyId,
            deletedAt: null,
            status: "COMPLETED",
            OR: toEmployeeRanges(tripGoals).map(({ employeeId, from, to }) => ({
              responsibleId: employeeId,
              tripDate: { gte: from, lt: to },
            })),
          },
          select: { responsibleId: true, producerId: true, tripDate: true },
        })
      : [],
    actionGoals.length > 0
      ? prisma.commercialAction.findMany({
          where: {
            companyId,
            deletedAt: null,
            OR: toEmployeeRanges(actionGoals).map(({ employeeId, from, to }) => ({
              responsibleId: employeeId,
              initialDate: { gte: from, lt: to },
            })),
          },
          select: { responsibleId: true, initialDate: true },
        })
      : [],
  ]);

  const tripsByEmployee = groupByEmployee(
    trips.map(({ responsibleId, producerId, tripDate }) => ({
      responsibleId,
      producerId,
      date: tripDate,
    })),
  );
  const actionsByEmployee = groupByEmployee(
    actions.map(({ responsibleId, initialDate }) => ({ responsibleId, date: initialDate })),
  );

  function getAchieved(goal: GoalAchievementInput): number {
    switch (goal.metric) {
      case GoalMetric.COMPLETED_TRIPS:
        return inPeriod(goal, tripsByEmployee.get(goal.employeeId)).length;
      case GoalMetric.VISITED_PRODUCERS:
        return new Set(
          inPeriod(goal, tripsByEmployee.get(goal.employeeId)).map(({ producerId }) => producerId),
        ).size;
      case GoalMetric.COMMERCIAL_ACTIONS:
        return inPeriod(goal, actionsByEmployee.get(goal.employeeId)).length;
      case GoalMetric.SALES:
        return goal.achievedValue ?? 0;
    }
  }

  return new Map(goals.map((goal) => [goal.id, getAchieved(goal)]));
}
