import { Potential } from "../entities/potential";

export const POTENTIAL_REPOSITORY = "PotentialRepository";

export interface FindPotentialsParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  includeDeleted: boolean;
}

export interface PotentialListItem {
  potential: Potential;
  producersCount: number;
}

export interface FindPotentialsResult {
  potentials: PotentialListItem[];
  total: number;
}

export interface PotentialRepository {
  create(potential: Potential): Promise<Potential>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Potential | null>;
  findByName(name: string, companyId: string): Promise<Potential | null>;
  findMany(params: FindPotentialsParams): Promise<FindPotentialsResult>;
  countProducers(id: string, companyId: string): Promise<number>;
  update(potential: Potential): Promise<Potential>;
  delete(potential: Potential): Promise<void>;
}
