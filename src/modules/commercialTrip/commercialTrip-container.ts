import { container } from "tsyringe";

import {
  COMMERCIAL_TRIP_REPOSITORY,
  CommercialTripRepository,
} from "./domain/repositories/commercialTrip-repository";
import { PrismaCommercialTripRepository } from "./infrastructure/prisma/prisma-commercialTrip-repository";

container.registerSingleton<CommercialTripRepository>(
  COMMERCIAL_TRIP_REPOSITORY,
  PrismaCommercialTripRepository,
);
