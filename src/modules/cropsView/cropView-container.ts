import { container } from "tsyringe";

import {
  CROP_VIEW_REPOSITORY,
  CropViewRepository,
} from "./domain/repositories/cropView-repository";
import { PrismaCropViewRepository } from "./infrastructure/prisma/prisma-cropView-repository";

container.registerSingleton<CropViewRepository>(
  CROP_VIEW_REPOSITORY,
  PrismaCropViewRepository,
);
