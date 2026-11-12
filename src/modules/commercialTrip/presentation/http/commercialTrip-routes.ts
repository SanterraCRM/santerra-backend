import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { CommercialTripController } from "./commercialTrip-controller";

export function commercialTripRouter(): Router {
  const router = Router();
  const controller = container.resolve(CommercialTripController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.COMMERCIAL_TRIPS_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.COMMERCIAL_TRIPS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.COMMERCIAL_TRIPS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.COMMERCIAL_TRIPS_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.COMMERCIAL_TRIPS_DELETE), controller.delete);

  return router;
}
