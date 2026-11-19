import { Router } from "express";
import { container } from "tsyringe";

import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ResellerViewController } from "./resellerView-controller";

export function resellerViewRouter(): Router {
  const router = Router();
  const controller = container.resolve(ResellerViewController);

  router.use(ensureAuthenticated);

  router.get("/", controller.list);
  router.get("/:id", controller.getById);

  return router;
}
