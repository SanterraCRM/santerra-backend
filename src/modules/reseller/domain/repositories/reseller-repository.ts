import { Reseller } from "../entities/reseller";

export const RESELLER_REPOSITORY = "ResellerRepository";

export const RESELLER_OPTIONAL_FIELDS = ["registrationNumber", "phoneNumber", "email"] as const;
export type ResellerOptionalField = (typeof RESELLER_OPTIONAL_FIELDS)[number];

export interface FindResellersParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  missing?: ResellerOptionalField[];
  includeDeleted: boolean;
}

export interface ResellerDetails {
  reseller: Reseller;
  actionsCount: number;
}

export interface FindResellersResult {
  resellers: ResellerDetails[];
  total: number;
}

export interface ResellerRepository {
  create(reseller: Reseller): Promise<ResellerDetails>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Reseller | null>;
  findDetailsById(id: string, companyId: string): Promise<ResellerDetails | null>;
  findByRegistrationNumber(
    registrationNumber: string,
    companyId: string,
  ): Promise<Reseller | null>;
  findManyByIds(ids: string[], companyId: string): Promise<Reseller[]>;
  findMany(params: FindResellersParams): Promise<FindResellersResult>;
  update(reseller: Reseller): Promise<ResellerDetails>;
  delete(reseller: Reseller): Promise<void>;
}
