import { ProductView } from "../entities/productView";

export const PRODUCT_VIEW_REPOSITORY = "ProductViewRepository";

export interface FindProductsViewParams {
  page: number;
  limit: number;
  search?: string;
}

export interface FindProductsViewResult {
  productsView: ProductView[];
  total: number;
}

export interface ProductViewRepository {
  findById(id: number): Promise<ProductView | null>;

  findMany(
    params: FindProductsViewParams,
  ): Promise<FindProductsViewResult>;
}