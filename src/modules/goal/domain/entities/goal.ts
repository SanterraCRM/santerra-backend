import { randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";
import { startOfLocalDate } from "../../../../shared/domain/local-date";
import { GoalMetric, isCountMetric } from "./goal-metric";

export const GOAL_MAX_VALUE = 999_999_999_999.99;

export interface GoalProps {
  id: string;
  employeeId: string;
  metric: GoalMetric;
  targetValue: number;
  achievedValue: number | null;
  startDate: Date;
  endDate: Date;
  description: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateGoalProps {
  employeeId: string;
  metric: GoalMetric;
  targetValue: number;
  achievedValue?: number | null;
  startDate: Date;
  endDate: Date;
  description?: string | null;
  companyId: string;
  createdById?: string | null;
}

export interface UpdateGoalProps {
  employeeId?: string;
  metric?: GoalMetric;
  targetValue?: number;
  achievedValue?: number | null;
  startDate?: Date;
  endDate?: Date;
  description?: string | null;
  updatedById?: string | null;
}

export class Goal {
  private constructor(private readonly props: GoalProps) {}

  static create(input: CreateGoalProps, id = randomUUID(), createdAt = new Date()): Goal {
    const goal = new Goal({
      id,
      employeeId: Goal.normalizeEmployeeId(input.employeeId),
      metric: input.metric,
      targetValue: input.targetValue,
      achievedValue: input.achievedValue ?? null,
      startDate: startOfLocalDate(input.startDate),
      endDate: startOfLocalDate(input.endDate),
      description: Goal.normalizeDescription(input.description),
      companyId: input.companyId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });

    goal.ensureConsistency();

    return goal;
  }

  static reconstitute(props: GoalProps): Goal {
    return new Goal({ ...props });
  }

  get employeeId(): string {
    return this.props.employeeId;
  }

  update(input: UpdateGoalProps, updatedAt = new Date()): void {
    if (input.employeeId !== undefined) {
      this.props.employeeId = Goal.normalizeEmployeeId(input.employeeId);
    }

    if (input.metric !== undefined) {
      this.props.metric = input.metric;

      if (input.achievedValue === undefined && isCountMetric(input.metric)) {
        this.props.achievedValue = null;
      }
    }

    if (input.targetValue !== undefined) {
      this.props.targetValue = input.targetValue;
    }

    if (input.achievedValue !== undefined) {
      this.props.achievedValue = input.achievedValue;
    }

    if (input.startDate !== undefined) {
      this.props.startDate = startOfLocalDate(input.startDate);
    }

    if (input.endDate !== undefined) {
      this.props.endDate = startOfLocalDate(input.endDate);
    }

    if (input.description !== undefined) {
      this.props.description = Goal.normalizeDescription(input.description);
    }

    this.ensureConsistency();
    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): GoalProps {
    return { ...this.props };
  }

  private ensureConsistency(): void {
    if (this.props.endDate < this.props.startDate) {
      throw new DomainError("A data final não pode ser antes da inicial.");
    }

    if (isCountMetric(this.props.metric) && !Number.isInteger(this.props.targetValue)) {
      throw new DomainError(
        "Nas metas de visitas, produtores e ações, a meta é um número inteiro.",
      );
    }

    if (isCountMetric(this.props.metric) && this.props.achievedValue !== null) {
      throw new DomainError(
        "O valor vendido só é lançado nas metas de vendas: os outros indicadores são calculados.",
      );
    }
  }

  private static normalizeEmployeeId(employeeId: string): string {
    if (typeof employeeId !== "string" || employeeId.trim().length === 0) {
      throw new DomainError("O ID do vendedor é obrigatório.");
    }

    return employeeId.trim();
  }

  private static normalizeDescription(description: string | null | undefined): string | null {
    return description?.trim() || null;
  }
}
