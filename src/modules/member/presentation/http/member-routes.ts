import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { MemberController } from "./member-controller";

export function memberRouter(): Router {
  const router = Router();
  const controller = container.resolve(MemberController);

  router.use(ensureAuthenticated, ensureTenant);

  router.get("/", ensurePermission(PERMISSIONS.MEMBERS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.MEMBERS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.MEMBERS_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.MEMBERS_DELETE), controller.delete);

  return router;
}
