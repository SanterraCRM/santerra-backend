export interface ListProductsDto {
  page?: number;
  limit?: number;
  search?: string;
  manufacturerId?: string;
  groupId?: string;
  priceMin?: number;
  priceMax?: number;
  createdFrom?: Date;
  createdTo?: Date;
  includeDeleted?: boolean;
}
