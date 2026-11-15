import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { CropViewController } from "./cropView-controller";

export function cropViewRouter(): Router {
  const router = Router();
  const controller = container.resolve(CropViewController);

  router.get("/", controller.list);
  router.get("/:id", controller.getById);

  return router;
}
