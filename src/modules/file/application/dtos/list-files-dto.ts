export interface ListFilesDto {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
}
