import { Router } from "express";
import { container } from "tsyringe";

import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { ensurePermission } from "../../../../shared/http/middlewares/ensure-permission";
import { ensureTenant } from "../../../../shared/http/middlewares/ensure-tenant";
import { uploadSingleFile } from "../../../../shared/http/middlewares/upload-single-file";
import { FILE_MAX_SIZE } from "../../domain/entities/file";
import { FileController } from "./file-controller";
import { FILE_FIELD_NAME } from "./file-schemas";

export function fileRouter(): Router {
  const router = Router();
  const controller = container.resolve(FileController);

  router.use(ensureAuthenticated, ensureTenant);

  router.post(
    "/",
    ensurePermission(PERMISSIONS.FILES_CREATE),
    uploadSingleFile(FILE_FIELD_NAME, FILE_MAX_SIZE),
    controller.create,
  );
  router.get("/", ensurePermission(PERMISSIONS.FILES_READ), controller.list);
  router.get("/:id", ensurePermission(PERMISSIONS.FILES_READ), controller.getById);
  router.get("/:id/download", ensurePermission(PERMISSIONS.FILES_READ), controller.download);
  router.patch("/:id", ensurePermission(PERMISSIONS.FILES_UPDATE), controller.update);
  router.delete("/:id", ensurePermission(PERMISSIONS.FILES_DELETE), controller.delete);

  return router;
}
