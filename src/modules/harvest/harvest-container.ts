import { container } from "tsyringe";

import {
  HARVEST_REPOSITORY,
  HarvestRepository,
} from "./domain/repositories/harvest-repository";
import { PrismaHarvestRepository } from "./infrastructure/prisma/prisma-harvest-repository";

container.registerSingleton<HarvestRepository>(
  HARVEST_REPOSITORY,
  PrismaHarvestRepository,
);
