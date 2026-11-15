import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ProductViewController } from "./product-controller";

export function productViewRouter(): Router {
  const router = Router();
  const controller = container.resolve(ProductViewController);

  router.use(ensureAuthenticated);

  router.get("/", controller.list);
  router.get("/:id", controller.getById);

  return router;
}
