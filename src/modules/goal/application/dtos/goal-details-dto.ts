import { GoalProps } from "../../domain/entities/goal";
import { GoalDetails, GoalRelation } from "../../domain/repositories/goal-repository";

export interface GoalDetailsDto extends GoalProps {
  employee: GoalRelation;
  achieved: number;
}

export function toGoalDetailsDto({ goal, employee, achieved }: GoalDetails): GoalDetailsDto {
  return { ...goal.toObject(), employee, achieved };
}
