import { container } from "tsyringe";

import {
  PRODUCER_REPOSITORY,
  ProducerRepository,
} from "./domain/repositories/producer-repository";
import { PrismaProducerRepository } from "./infrastructure/prisma/prisma-producer-repository";

container.registerSingleton<ProducerRepository>(
  PRODUCER_REPOSITORY,
  PrismaProducerRepository,
);
