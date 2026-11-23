import { container } from "tsyringe";

import {
  PRODUCT_VIEW_REPOSITORY,
  ProductViewRepository,
} from "./domain/repositories/productView-repository";
import { PrismaProductViewRepository } from "./infrastructure/prisma/prisma-productView-repository";

container.registerSingleton<ProductViewRepository>(
  PRODUCT_VIEW_REPOSITORY,
  PrismaProductViewRepository,
);
