import { container } from "tsyringe";

import {
  DASHBOARD_REPOSITORY,
  DashboardRepository,
} from "./domain/repositories/dashboard-repository";
import { PrismaDashboardRepository } from "./infrastructure/prisma/prisma-dashboard-repository";

container.registerSingleton<DashboardRepository>(
  DASHBOARD_REPOSITORY,
  PrismaDashboardRepository,
);
