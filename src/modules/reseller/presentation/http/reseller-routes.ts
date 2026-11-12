import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { ResellerController } from "./reseller-controller";

export function resellerRouter(): Router {
  const router = Router();
  const controller = container.resolve(ResellerController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.RESELLERS_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.RESELLERS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.RESELLERS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.RESELLERS_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.RESELLERS_DELETE), controller.delete);

  return router;
}
