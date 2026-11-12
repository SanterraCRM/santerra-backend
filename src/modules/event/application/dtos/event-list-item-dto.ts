import { EventProps } from "../../domain/entities/event";

export interface EventListItemDto extends EventProps {
  actionsCount: number;
}
