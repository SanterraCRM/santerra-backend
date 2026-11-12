import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { RoleController } from "./role-controller";

export function roleRouter(): Router {
  const router = Router();
  const controller = container.resolve(RoleController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.ROLES_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.ROLES_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.ROLES_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.ROLES_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.ROLES_DELETE), controller.delete);

  return router;
}
