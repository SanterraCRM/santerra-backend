import { ProductView } from "../entities/productView";

export const PRODUCT_VIEW_REPOSITORY = "ProductViewRepository";

export interface FindProductsViewParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  manufacturerId?: string;
  department?: string;
  section?: string;
  category?: string;
  line?: string;
  crop?: string;
}

export interface FindProductsViewResult {
  productsView: ProductView[];
  total: number;
}

export interface ProductViewFilterOptions {
  manufacturers: { id: string; name: string }[];
  departments: string[];
  sections: string[];
  categories: string[];
  lines: string[];
  crops: string[];
}

export interface ProductViewRepository {
  findById(id: number): Promise<ProductView | null>;

  findManyByIds(ids: number[]): Promise<ProductView[]>;

  findMany(
    params: FindProductsViewParams,
  ): Promise<FindProductsViewResult>;

  findCropsByProductIds(productIds: number[]): Promise<Map<number, string[]>>;

  findFilterOptions(): Promise<ProductViewFilterOptions>;
}
