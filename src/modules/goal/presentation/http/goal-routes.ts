import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { GoalController } from "./goal-controller";

export function goalRouter(): Router {
  const router = Router();
  const controller = container.resolve(GoalController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.GOALS_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.GOALS_READ), controller.list);
  router.get("/summary", ensurePermission(PERMISSIONS.GOALS_READ), controller.summary);
  router.get("/:id", ensurePermission(PERMISSIONS.GOALS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.GOALS_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.GOALS_DELETE), controller.delete);

  return router;
}
