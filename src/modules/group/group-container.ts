import { container } from "tsyringe";

import {
  GROUP_REPOSITORY,
  GroupRepository,
} from "./domain/repositories/group-repository";
import { PrismaGroupRepository } from "./infrastructure/prisma/prisma-group-repository";

container.registerSingleton<GroupRepository>(
  GROUP_REPOSITORY,
  PrismaGroupRepository,
);
