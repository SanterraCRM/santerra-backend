import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { EmployeeController } from "./employee-controller";

export function employeeRouter(): Router {
  const router = Router();
  const controller = container.resolve(EmployeeController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post("/", ensurePermission(PERMISSIONS.EMPLOYEES_CREATE), controller.create);
  router.get("/", ensurePermission(PERMISSIONS.EMPLOYEES_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.EMPLOYEES_READ), controller.getById);
  router.patch("/:id", ensurePermission(PERMISSIONS.EMPLOYEES_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.EMPLOYEES_DELETE), controller.delete);

  return router;
}
