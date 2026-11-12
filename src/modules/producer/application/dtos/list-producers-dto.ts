export interface ListProducersDto {
  page?: number;
  limit?: number;
  search?: string;
  potentialId?: string;
  includeDeleted?: boolean;
}
