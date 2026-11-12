import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { ProducerController } from "./producer-controller";

export function producerRouter(): Router {
  const router = Router();
  const controller = container.resolve(ProducerController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.PRODUCERS_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.PRODUCERS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.PRODUCERS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.PRODUCERS_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.PRODUCERS_DELETE), controller.delete);

  return router;
}
