import { container } from "tsyringe";

import {
  USER_REPOSITORY,
  UserRepository,
} from "./domain/repositories/user-repository";
import { PrismaUserRepository } from "./infrastructure/prisma/prisma-user-repository";

container.registerSingleton<UserRepository>(
  USER_REPOSITORY,
  PrismaUserRepository,
);
