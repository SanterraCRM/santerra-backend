import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensurePlatformAdmin } from "../../../../shared/http/middlewares/ensure-platform-admin";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { uploadSingleFile } from "../../../../shared/http/middlewares/upload-single-file";
import { COMPANY_LOGO_MAX_SIZE } from "../../domain/company-logo";
import { CompanyController } from "./company-controller";
import { COMPANY_LOGO_FIELD_NAME } from "./company-schemas";

export function companyRouter(): Router {
  const router = Router();
  const controller = container.resolve(CompanyController);

  router.get("/:id/logo", controller.getLogo);

  router.use(ensureAuthenticated);

  router.get("/current", ensureTenant, controller.getCurrent);
  router.patch(
    "/current",
    ensureTenant,
    ensurePermission(PERMISSIONS.COMPANY_UPDATE),
    controller.updateCurrent,
  );
  router.put(
    "/current/logo",
    ensureTenant,
    ensurePermission(PERMISSIONS.COMPANY_UPDATE),
    uploadSingleFile(COMPANY_LOGO_FIELD_NAME, COMPANY_LOGO_MAX_SIZE),
    controller.updateCurrentLogo,
  );
  router.delete(
    "/current/logo",
    ensureTenant,
    ensurePermission(PERMISSIONS.COMPANY_UPDATE),
    controller.removeCurrentLogo,
  );

  router.post("/", ensurePlatformAdmin, controller.create);
  router.get("/", ensurePlatformAdmin, controller.list);
  router.get("/:id", ensurePlatformAdmin, controller.getById);
  router.patch("/:id", ensurePlatformAdmin, controller.update);
  router.delete("/:id", ensurePlatformAdmin, controller.delete);

  return router;
}
