import { container } from "tsyringe";

import {
  EVENT_REPOSITORY,
  EventRepository,
} from "./domain/repositories/event-repository";
import { PrismaEventRepository } from "./infrastructure/prisma/prisma-event-repository";

container.registerSingleton<EventRepository>(
  EVENT_REPOSITORY,
  PrismaEventRepository,
);
