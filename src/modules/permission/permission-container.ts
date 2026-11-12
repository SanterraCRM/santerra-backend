import { container } from "tsyringe";

import {
  PERMISSION_REPOSITORY,
  PermissionRepository,
} from "./domain/repositories/permission-repository";
import { PrismaPermissionRepository } from "./infrastructure/prisma/prisma-permission-repository";

container.registerSingleton<PermissionRepository>(
  PERMISSION_REPOSITORY,
  PrismaPermissionRepository,
);
