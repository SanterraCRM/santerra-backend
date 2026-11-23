import { Prisma, Goal as PrismaGoal } from "@prisma/client";

import { Goal } from "../../domain/entities/goal";
import { GoalMetric } from "../../domain/entities/goal-metric";
import { GoalDetails } from "../../domain/repositories/goal-repository";
import { GoalAchievementInput } from "./goal-achievements";

export const goalDetailsInclude = {
  employee: { select: { id: true, person: { select: { name: true } } } },
} satisfies Prisma.GoalInclude;

export type PrismaGoalDetails = Prisma.GoalGetPayload<{ include: typeof goalDetailsInclude }>;

export class PrismaGoalMapper {
  static toDomain(raw: PrismaGoal): Goal {
    return Goal.reconstitute({
      id: raw.id,
      employeeId: raw.employeeId,
      metric: raw.metric as GoalMetric,
      targetValue: raw.targetValue.toNumber(),
      achievedValue: raw.achievedValue?.toNumber() ?? null,
      startDate: raw.startDate,
      endDate: raw.endDate,
      description: raw.description,
      companyId: raw.companyId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }

  static toAchievementInput(raw: PrismaGoal): GoalAchievementInput {
    return {
      id: raw.id,
      employeeId: raw.employeeId,
      metric: raw.metric as GoalMetric,
      startDate: raw.startDate,
      endDate: raw.endDate,
      achievedValue: raw.achievedValue?.toNumber() ?? null,
    };
  }

  static toDetails({ employee, ...raw }: PrismaGoalDetails, achieved: number): GoalDetails {
    return {
      goal: PrismaGoalMapper.toDomain(raw),
      employee: { id: employee.id, name: employee.person.name },
      achieved,
    };
  }
}
