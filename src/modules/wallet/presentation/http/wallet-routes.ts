import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { WalletController } from "./wallet-controller";

export function walletRouter(): Router {
  const router = Router();
  const controller = container.resolve(WalletController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.WALLETS_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.WALLETS_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.WALLETS_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.WALLETS_UPDATE), controller.update);
  router.post("/:id/credits", ensurePermission(PERMISSIONS.WALLETS_UPDATE), controller.credit);
  router.delete("/:id", ensurePermission(PERMISSIONS.WALLETS_DELETE), controller.delete);

  return router;
}
