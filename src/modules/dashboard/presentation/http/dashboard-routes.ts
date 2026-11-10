import { Router } from "express";
import { container } from "tsyringe";

import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { DashboardController } from "./dashboard-controller";

export function dashboardRouter(): Router {
  const router = Router();
  const controller = container.resolve(DashboardController);

  router.use(ensureAuthenticated, ensureTenant);

  router.get("/summary", controller.summary);

  return router;
}
