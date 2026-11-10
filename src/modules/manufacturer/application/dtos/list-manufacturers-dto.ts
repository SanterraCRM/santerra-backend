import { ManufacturerOptionalField } from "../../domain/repositories/manufacturer-repository";

export interface ListManufacturersDto {
  page?: number;
  limit?: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  missing?: ManufacturerOptionalField[];
  includeDeleted?: boolean;
}
