import { Harvest } from "../entities/harvest";

export const HARVEST_REPOSITORY = "HarvestRepository";

export interface FindHarvestsParams {
  page: number;
  limit: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  includeDeleted: boolean;
}

export interface HarvestDetails {
  harvest: Harvest;
  tripsCount: number;
}

export interface FindHarvestsResult {
  harvests: HarvestDetails[];
  total: number;
}

export interface HarvestRepository {
  create(harvest: Harvest): Promise<HarvestDetails>;
  findById(id: string, includeDeleted?: boolean): Promise<Harvest | null>;
  findDetailsById(id: string): Promise<HarvestDetails | null>;
  findByName(name: string): Promise<Harvest | null>;
  findManyByIds(ids: string[]): Promise<Harvest[]>;
  findMany(params: FindHarvestsParams): Promise<FindHarvestsResult>;
  update(harvest: Harvest): Promise<HarvestDetails>;
  delete(harvest: Harvest): Promise<void>;
}
