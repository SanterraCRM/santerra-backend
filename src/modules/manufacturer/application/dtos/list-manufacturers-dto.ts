import { ListSort } from "../../../../shared/domain/list-sort";
import { ManufacturerOptionalField } from "../../domain/repositories/manufacturer-repository";

export interface ListManufacturersDto {
  page?: number;
  limit?: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  missing?: ManufacturerOptionalField[];
  sort?: ListSort;
  includeDeleted?: boolean;
}
