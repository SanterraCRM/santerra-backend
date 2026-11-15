import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ResellerViewController } from "./resellerView-controller";

export function resellerViewRouter(): Router {
  const router = Router();
  const controller = container.resolve(ResellerViewController);

  router.get("/", controller.list);
  router.get("/:id", controller.getById);

  return router;
}
