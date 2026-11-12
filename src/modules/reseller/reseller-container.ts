import { container } from "tsyringe";

import {
  RESELLER_REPOSITORY,
  ResellerRepository,
} from "./domain/repositories/reseller-repository";
import { PrismaResellerRepository } from "./infrastructure/prisma/prisma-reseller-repository";

container.registerSingleton<ResellerRepository>(
  RESELLER_REPOSITORY,
  PrismaResellerRepository,
);
