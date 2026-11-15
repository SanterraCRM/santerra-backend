import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ProductViewController } from "./product-controller";

export function productViewRouter(): Router {
  const router = Router();
  const controller = container.resolve(ProductViewController);

  router.get("/", ensurePermission(PERMISSIONS.PRODUCTS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.PRODUCTS_READ), controller.getById);

  return router;
}
