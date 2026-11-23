import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { startOfLocalDate } from "../../../../shared/domain/local-date";
import { Goal } from "../../domain/entities/goal";
import { GOAL_METRICS } from "../../domain/entities/goal-metric";
import {
  FindGoalsParams,
  FindGoalsResult,
  GoalDetails,
  GoalFilters,
  GoalMetricSummary,
  GoalRepository,
  GoalStatus,
} from "../../domain/repositories/goal-repository";
import { computeGoalAchievements } from "./goal-achievements";
import { goalDetailsInclude, PrismaGoalDetails, PrismaGoalMapper } from "./prisma-goal-mapper";

function toStatusWhere(status: GoalStatus, today: Date): Prisma.GoalWhereInput {
  switch (status) {
    case "current":
      return { startDate: { lte: today }, endDate: { gte: today } };
    case "upcoming":
      return { startDate: { gt: today } };
    case "finished":
      return { endDate: { lt: today } };
  }
}

function sumInCents(values: number[]): number {
  return values.reduce((total, value) => total + Math.round(value * 100), 0) / 100;
}

@injectable()
export class PrismaGoalRepository implements GoalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(goal: Goal): Promise<GoalDetails> {
    const createdGoal = await this.prisma.goal.create({
      data: goal.toObject(),
      include: goalDetailsInclude,
    });

    return this.withAchievement(createdGoal);
  }

  async findById(id: string, companyId: string): Promise<Goal | null> {
    const goal = await this.prisma.goal.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    return goal ? PrismaGoalMapper.toDomain(goal) : null;
  }

  async findDetailsById(id: string, companyId: string): Promise<GoalDetails | null> {
    const goal = await this.prisma.goal.findFirst({
      where: { id, companyId, deletedAt: null },
      include: goalDetailsInclude,
    });

    return goal ? this.withAchievement(goal) : null;
  }

  async findMany(params: FindGoalsParams): Promise<FindGoalsResult> {
    const where = this.buildWhere(params, params.includeDeleted);
    const [goals, total] = await this.prisma.$transaction([
      this.prisma.goal.findMany({
        where,
        include: goalDetailsInclude,
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.goal.count({ where }),
    ]);
    const achievements = await computeGoalAchievements(
      this.prisma,
      params.companyId,
      goals.map(PrismaGoalMapper.toAchievementInput),
    );

    return {
      goals: goals.map((goal) => PrismaGoalMapper.toDetails(goal, achievements.get(goal.id) ?? 0)),
      total,
    };
  }

  async summarize(filters: GoalFilters): Promise<GoalMetricSummary[]> {
    const rows = await this.prisma.goal.findMany({ where: this.buildWhere(filters) });
    const goals = rows.map((row) => ({
      ...PrismaGoalMapper.toAchievementInput(row),
      targetValue: row.targetValue.toNumber(),
    }));
    const achievements = await computeGoalAchievements(this.prisma, filters.companyId, goals);

    return GOAL_METRICS.map((metric) => {
      const metricGoals = goals.filter((goal) => goal.metric === metric);

      return {
        metric,
        goalsCount: metricGoals.length,
        targetValue: sumInCents(metricGoals.map((goal) => goal.targetValue)),
        achieved: sumInCents(metricGoals.map((goal) => achievements.get(goal.id) ?? 0)),
      };
    }).filter((summary) => summary.goalsCount > 0);
  }

  async update(goal: Goal): Promise<GoalDetails> {
    const props = goal.toObject();
    const updatedGoal = await this.prisma.goal.update({
      where: { id: props.id, companyId: props.companyId, deletedAt: null },
      data: {
        employeeId: props.employeeId,
        metric: props.metric,
        targetValue: props.targetValue,
        achievedValue: props.achievedValue,
        startDate: props.startDate,
        endDate: props.endDate,
        description: props.description,
        updatedAt: props.updatedAt,
        updatedById: props.updatedById,
      },
      include: goalDetailsInclude,
    });

    return this.withAchievement(updatedGoal);
  }

  async delete(goal: Goal): Promise<void> {
    const props = goal.toObject();

    await this.prisma.goal.update({
      where: { id: props.id, companyId: props.companyId, deletedAt: null },
      data: { deletedAt: props.deletedAt, deletedById: props.deletedById },
    });
  }

  private async withAchievement(goal: PrismaGoalDetails): Promise<GoalDetails> {
    const achievements = await computeGoalAchievements(this.prisma, goal.companyId, [
      PrismaGoalMapper.toAchievementInput(goal),
    ]);

    return PrismaGoalMapper.toDetails(goal, achievements.get(goal.id) ?? 0);
  }

  private buildWhere(filters: GoalFilters, includeDeleted = false): Prisma.GoalWhereInput {
    const conditions: Prisma.GoalWhereInput[] = [];

    if (filters.status) {
      conditions.push(toStatusWhere(filters.status, filters.today));
    }

    if (filters.periodFrom) {
      conditions.push({ endDate: { gte: startOfLocalDate(filters.periodFrom) } });
    }

    if (filters.periodTo) {
      conditions.push({ startDate: { lte: filters.periodTo } });
    }

    return {
      companyId: filters.companyId,
      deletedAt: includeDeleted ? undefined : null,
      employeeId: filters.employeeId,
      metric: filters.metric,
      AND: conditions,
      OR: filters.search
        ? [
            { employee: { person: { name: { contains: filters.search, mode: "insensitive" } } } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ]
        : undefined,
    };
  }
}
