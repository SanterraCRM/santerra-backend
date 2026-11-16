export interface ListProductsViewDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  manufacturerId?: string;
  department?: string;
  section?: string;
  category?: string;
  line?: string;
  crop?: string;
}
