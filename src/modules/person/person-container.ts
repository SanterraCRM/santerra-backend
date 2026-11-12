import { container } from "tsyringe";

import {
  PERSON_REPOSITORY,
  PersonRepository,
} from "./domain/repositories/person-repository";
import { PrismaPersonRepository } from "./infrastructure/prisma/prisma-person-repository";

container.registerSingleton<PersonRepository>(
  PERSON_REPOSITORY,
  PrismaPersonRepository,
);
