import { container } from "tsyringe";

import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from "./domain/repositories/product-repository";
import { PrismaProductRepository } from "./infrastructure/prisma/prisma-product-repository";

container.registerSingleton<ProductRepository>(
  PRODUCT_REPOSITORY,
  PrismaProductRepository,
);
