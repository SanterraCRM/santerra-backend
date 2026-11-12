import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { EventController } from "./event-controller";

export function eventRouter(): Router {
  const router = Router();
  const controller = container.resolve(EventController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.EVENTS_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.EVENTS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.EVENTS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.EVENTS_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.EVENTS_DELETE), controller.delete);

  return router;
}
