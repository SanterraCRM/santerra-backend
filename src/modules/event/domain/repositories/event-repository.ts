import { Event } from "../entities/event";

export const EVENT_REPOSITORY = "EventRepository";

export interface FindEventsParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  includeDeleted: boolean;
}

export interface EventListItem {
  event: Event;
  actionsCount: number;
}

export interface FindEventsResult {
  events: EventListItem[];
  total: number;
}

export interface EventRepository {
  create(event: Event): Promise<Event>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Event | null>;
  findByName(name: string, companyId: string): Promise<Event | null>;
  findMany(params: FindEventsParams): Promise<FindEventsResult>;
  countActions(id: string, companyId: string): Promise<number>;
  update(event: Event): Promise<Event>;
  delete(event: Event): Promise<void>;
}
