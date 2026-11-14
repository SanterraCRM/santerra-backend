export interface ListCompaniesDto {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  includeDeleted?: boolean;
}
