import { ResellerView } from "../entities/resellersView";

export const RESELLER_VIEW_REPOSITORY = "ResellerViewRepository";

export const RESELLER_VIEW_MISSING_FIELDS = ["document", "clientPhone", "email"] as const;

export type ResellerViewMissingField = (typeof RESELLER_VIEW_MISSING_FIELDS)[number];

export interface FindResellersViewParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  missing?: ResellerViewMissingField[];
}

export interface FindResellersViewResult {
  resellersView: ResellerView[];
  total: number;
}

export interface ResellerViewRepository {
  findById(id: number): Promise<ResellerView | null>;

  findManyByIds(ids: number[]): Promise<ResellerView[]>;

  findMany(
    params: FindResellersViewParams,
  ): Promise<FindResellersViewResult>;
}
