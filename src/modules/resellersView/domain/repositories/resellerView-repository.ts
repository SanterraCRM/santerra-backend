import { ResellerView } from "../entities/resellersView";

export const RESELLER_VIEW_REPOSITORY = "ResellerViewRepository";

export interface FindResellersViewParams {
  page: number;
  limit: number;
  search?: string;
}

export interface FindResellersViewResult {
  resellersView: ResellerView[];
  total: number;
}

export interface ResellerViewRepository {
  findById(id: number): Promise<ResellerView | null>;

  findMany(
    params: FindResellersViewParams,
  ): Promise<FindResellersViewResult>;
}