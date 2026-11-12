import { container } from "tsyringe";

import {
  FILE_REPOSITORY,
  FileRepository,
} from "./domain/repositories/file-repository";
import { PrismaFileRepository } from "./infrastructure/prisma/prisma-file-repository";

container.registerSingleton<FileRepository>(
  FILE_REPOSITORY,
  PrismaFileRepository,
);
