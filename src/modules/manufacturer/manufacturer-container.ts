import { container } from "tsyringe";

import {
  MANUFACTURER_REPOSITORY,
  ManufacturerRepository,
} from "./domain/repositories/manufacturer-repository";
import { PrismaManufacturerRepository } from "./infrastructure/prisma/prisma-manufacturer-repository";

container.registerSingleton<ManufacturerRepository>(
  MANUFACTURER_REPOSITORY,
  PrismaManufacturerRepository,
);
