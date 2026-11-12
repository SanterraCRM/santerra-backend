export interface ListCompaniesDto {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
}
