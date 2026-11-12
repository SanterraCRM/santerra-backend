import { container } from "tsyringe";

import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from "./domain/repositories/company-repository";
import { PrismaCompanyRepository } from "./infrastructure/prisma/prisma-company-repository";

container.registerSingleton<CompanyRepository>(
  COMPANY_REPOSITORY,
  PrismaCompanyRepository,
);
