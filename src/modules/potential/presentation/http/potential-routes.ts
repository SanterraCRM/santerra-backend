import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { PotentialController } from "./potential-controller";

export function potentialRouter(): Router {
  const router = Router();
  const controller = container.resolve(PotentialController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.POTENTIALS_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.POTENTIALS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.POTENTIALS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.POTENTIALS_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.POTENTIALS_DELETE), controller.delete);

  return router;
}
