import { Router } from "express";
import { container } from "tsyringe";

import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { CropViewController } from "./cropView-controller";

export function cropViewRouter(): Router {
  const router = Router();
  const controller = container.resolve(CropViewController);

  router.use(ensureAuthenticated);

  router.get("/", controller.list);
  router.get("/:productId", controller.getById);

  return router;
}
