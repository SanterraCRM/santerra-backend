import { container } from "tsyringe";

import {
  POTENTIAL_REPOSITORY,
  PotentialRepository,
} from "./domain/repositories/potential-repository";
import { PrismaPotentialRepository } from "./infrastructure/prisma/prisma-potential-repository";

container.registerSingleton<PotentialRepository>(
  POTENTIAL_REPOSITORY,
  PrismaPotentialRepository,
);
