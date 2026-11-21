import { ListSort } from "../../../../shared/domain/list-sort";

export interface ListEventsDto {
  page?: number;
  limit?: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  sort?: ListSort;
  includeDeleted?: boolean;
}
