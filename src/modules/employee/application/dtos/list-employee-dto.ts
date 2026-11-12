export interface ListEmployeesDto {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  includeDeleted?: boolean;
}
