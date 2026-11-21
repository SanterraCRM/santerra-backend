import { Company } from "../entities/company";

export const COMPANY_REPOSITORY = "CompanyRepository";

export interface FindCompaniesParams {
  page: number;
  limit: number;
  search?: string;
  active?: boolean;
  includeDeleted: boolean;
}

export interface CompanyOwner {
  id: string;
  name: string;
  email: string;
}

export interface CompanyDetails {
  company: Company;
  owner: CompanyOwner | null;
  membersCount: number;
}

export interface FindCompaniesResult {
  companies: CompanyDetails[];
  total: number;
}

export interface CompanyRepository {
  create(company: Company): Promise<Company>;
  findById(id: string, includeDeleted?: boolean): Promise<Company | null>;
  findDetailsById(id: string): Promise<CompanyDetails | null>;
  findMany(params: FindCompaniesParams): Promise<FindCompaniesResult>;
  update(company: Company): Promise<Company>;
  delete(company: Company): Promise<void>;
}
