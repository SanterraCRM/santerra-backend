import { Router } from "express";
import { container } from "tsyringe";

import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePlatformAdmin } from "../../../../shared/http/middlewares/ensure-platform-admin";
import { HarvestController } from "./harvest-controller";

export function harvestRouter(): Router {
  const router = Router();
  const controller = container.resolve(HarvestController);

  router.use(ensureAuthenticated);

  router.post("/", ensurePlatformAdmin, controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.patch("/:id", ensurePlatformAdmin, controller.update);
  router.delete("/:id", ensurePlatformAdmin, controller.delete);

  return router;
}
