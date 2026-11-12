export interface ListUsersDto {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  includeDeleted?: boolean;
}
