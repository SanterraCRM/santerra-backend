import { container } from "tsyringe";

import {
  ROLE_REPOSITORY,
  RoleRepository,
} from "./domain/repositories/role-repository";
import { PrismaRoleRepository } from "./infrastructure/prisma/prisma-role-repository";

container.registerSingleton<RoleRepository>(
  ROLE_REPOSITORY,
  PrismaRoleRepository,
);
