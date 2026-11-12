import { Manufacturer } from "../entities/manufacturer";

export const MANUFACTURER_REPOSITORY = "ManufacturerRepository";

export const MANUFACTURER_OPTIONAL_FIELDS = ["registrationNumber", "phoneNumber", "email"] as const;
export type ManufacturerOptionalField = (typeof MANUFACTURER_OPTIONAL_FIELDS)[number];

export interface FindManufacturersParams {
  page: number;
  limit: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  missing?: ManufacturerOptionalField[];
  includeDeleted: boolean;
}

export interface ManufacturerListItem {
  manufacturer: Manufacturer;
  productsCount: number;
}

export interface FindManufacturersResult {
  manufacturers: ManufacturerListItem[];
  total: number;
}

export interface ManufacturerRepository {
  create(manufacturer: Manufacturer): Promise<Manufacturer>;
  findById(id: string, includeDeleted?: boolean): Promise<Manufacturer | null>;
  findByName(name: string): Promise<Manufacturer | null>;
  findMany(params: FindManufacturersParams): Promise<FindManufacturersResult>;
  countProducts(id: string): Promise<number>;
  update(manufacturer: Manufacturer): Promise<Manufacturer>;
  delete(manufacturer: Manufacturer): Promise<void>;
}
