import { Router } from "express";
import { container } from "tsyringe";

import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePlatformAdmin } from "../../../../shared/http/middlewares/ensure-platform-admin";
import { UserController } from "./user-controller";

export function userRouter(): Router {
  const router = Router();
  const controller = container.resolve(UserController);

  router.use(ensureAuthenticated, ensurePlatformAdmin);

  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
