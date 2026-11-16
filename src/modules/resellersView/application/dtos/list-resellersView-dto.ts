import { ResellerViewMissingField } from "../../domain/repositories/resellerView-repository";

export interface ListResellersViewDto {
  page?: number;
  limit?: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  missing?: ResellerViewMissingField[];
}
