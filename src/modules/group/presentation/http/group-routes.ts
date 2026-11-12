import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { GroupController } from "./group-controller";

export function groupRouter(): Router {
  const router = Router();
  const controller = container.resolve(GroupController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.GROUPS_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.GROUPS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.GROUPS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.GROUPS_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.GROUPS_DELETE), controller.delete);

  return router;
}
