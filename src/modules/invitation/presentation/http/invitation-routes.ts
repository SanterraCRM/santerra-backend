import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { InvitationController } from "./invitation-controller";

export function invitationRouter(): Router {
  const router = Router();
  const controller = container.resolve(InvitationController);

  router.get("/preview", controller.preview);
  router.post("/accept", controller.accept);

  router.post(
    "/",
    ensureAuthenticated,
    ensureTenant,
    ensurePermission(PERMISSIONS.INVITATIONS_CREATE),
    controller.create,
  );
  router.get(
    "/",
    ensureAuthenticated,
    ensureTenant,
    ensurePermission(PERMISSIONS.INVITATIONS_READ),
    controller.list,
  );
  router.delete(
    "/:id",
    ensureAuthenticated,
    ensureTenant,
    ensurePermission(PERMISSIONS.INVITATIONS_DELETE),
    controller.delete,
  );

  return router;
}
