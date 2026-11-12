import { container } from "tsyringe";

import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from "./domain/repositories/employee-repository";
import { PrismaEmployeeRepository } from "./infrastructure/prisma/prisma-employee-repository";

container.registerSingleton<EmployeeRepository>(
  EMPLOYEE_REPOSITORY,
  PrismaEmployeeRepository,
);
