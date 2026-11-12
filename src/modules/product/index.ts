import "./product-container";

export { Product } from "./domain/entities/product";
export { PRODUCT_REPOSITORY } from "./domain/repositories/product-repository";
export type { ProductRepository } from "./domain/repositories/product-repository";
export { productRouter } from "./presentation/http/product-routes";
