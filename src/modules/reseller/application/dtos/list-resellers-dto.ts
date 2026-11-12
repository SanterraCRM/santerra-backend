import { ResellerOptionalField } from "../../domain/repositories/reseller-repository";

export interface ListResellersDto {
  page?: number;
  limit?: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  missing?: ResellerOptionalField[];
  includeDeleted?: boolean;
}
