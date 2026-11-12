import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { ProductController } from "./product-controller";

export function productRouter(): Router {
  const router = Router();
  const controller = container.resolve(ProductController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.PRODUCTS_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.PRODUCTS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.PRODUCTS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.PRODUCTS_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.PRODUCTS_DELETE), controller.delete);

  return router;
}
