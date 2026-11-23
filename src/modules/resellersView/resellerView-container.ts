import { container } from "tsyringe";

import {
  RESELLER_VIEW_REPOSITORY,
  ResellerViewRepository,
} from "./domain/repositories/resellerView-repository";
import { PrismaResellerViewRepository } from "./infrastructure/prisma/prisma-resellerView-repository";

container.registerSingleton<ResellerViewRepository>(
  RESELLER_VIEW_REPOSITORY,
  PrismaResellerViewRepository,
);
