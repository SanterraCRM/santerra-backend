import { Product } from "../entities/product";

export const PRODUCT_REPOSITORY = "ProductRepository";

export interface FindProductsParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  manufacturerId?: string;
  groupId?: string;
  priceMin?: number;
  priceMax?: number;
  createdFrom?: Date;
  createdTo?: Date;
  includeDeleted: boolean;
}

export interface ProductFile {
  id: string;
  originalName: string | null;
  mimeType: string;
  size: number;
}

export interface ProductDetails {
  product: Product;
  manufacturer: { id: string; name: string };
  groups: { id: string; name: string }[];
  files: ProductFile[];
}

export interface FindProductsResult {
  products: ProductDetails[];
  total: number;
}

export interface ProductRepository {
  create(product: Product): Promise<ProductDetails>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Product | null>;
  findDetailsById(id: string, companyId: string): Promise<ProductDetails | null>;
  findManyByIds(ids: string[], companyId: string): Promise<Product[]>;
  findMany(params: FindProductsParams): Promise<FindProductsResult>;
  update(product: Product): Promise<ProductDetails>;
  delete(product: Product): Promise<void>;
}
