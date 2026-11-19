import { ResellerViewMissingField } from "../../domain/repositories/resellerView-repository";

export interface ListResellersViewDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  missing?: ResellerViewMissingField[];
}
