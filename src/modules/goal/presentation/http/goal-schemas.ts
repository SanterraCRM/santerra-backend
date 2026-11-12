import { z } from "zod";

import { dateTimeQuerySchema, listQuerySchema } from "../../../../shared/http/request-schemas";
import { GOAL_MAX_VALUE } from "../../domain/entities/goal";
import { GoalMetric } from "../../domain/entities/goal-metric";
import { GOAL_STATUSES } from "../../domain/repositories/goal-repository";

export const createGoalSchema = z.object({
  employeeId: z.uuid(),
  metric: z.enum(GoalMetric),
  targetValue: z.number().positive().max(GOAL_MAX_VALUE),
  achievedValue: z.number().min(0).max(GOAL_MAX_VALUE).nullish(),
  startDate: dateTimeQuerySchema,
  endDate: dateTimeQuerySchema,
  description: z.string().nullish(),
});

export const updateGoalSchema = createGoalSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

const goalFiltersQuerySchema = z.object({
  search: z.string().optional(),
  employeeId: z.uuid().optional(),
  metric: z.enum(GoalMetric).optional(),
  status: z.enum(GOAL_STATUSES).optional(),
  periodFrom: dateTimeQuerySchema.optional(),
  periodTo: dateTimeQuerySchema.optional(),
});

export const listGoalsQuerySchema = listQuerySchema.extend(goalFiltersQuerySchema.shape);

export const summarizeGoalsQuerySchema = goalFiltersQuerySchema;
