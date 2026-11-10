export interface ListRolesDto {
  page?: number;
  limit?: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  includeDeleted?: boolean;
}
