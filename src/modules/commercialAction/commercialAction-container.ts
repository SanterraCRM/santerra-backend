import { container } from "tsyringe";

import {
  COMMERCIAL_ACTION_REPOSITORY,
  CommercialActionRepository,
} from "./domain/repositories/commercialAction-repository";
import { PrismaCommercialActionRepository } from "./infrastructure/prisma/prisma-commercialAction-repository";

container.registerSingleton<CommercialActionRepository>(
  COMMERCIAL_ACTION_REPOSITORY,
  PrismaCommercialActionRepository,
);
