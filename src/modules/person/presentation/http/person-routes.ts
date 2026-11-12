import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { PersonController } from "./person-controller";

export function personRouter(): Router {
  const router = Router();
  const controller = container.resolve(PersonController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.PERSONS_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.PERSONS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.PERSONS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.PERSONS_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.PERSONS_DELETE), controller.delete);

  return router;
}
