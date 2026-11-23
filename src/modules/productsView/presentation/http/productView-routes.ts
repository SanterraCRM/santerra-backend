import { Router } from "express";
import { container } from "tsyringe";

import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ProductViewController } from "./product-controller";

export function productViewRouter(): Router {
  const router = Router();
  const controller = container.resolve(ProductViewController);

  router.use(ensureAuthenticated);

  router.get("/", controller.list);
  router.get("/filter-options", controller.filterOptions);
  router.get("/:id", controller.getById);

  return router;
}
