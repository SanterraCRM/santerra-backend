import { Router } from "express";
import { container } from "tsyringe";

import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { uploadSingleFile } from "../../../../shared/http/middlewares/upload-single-file";
import { COMPANY_LOGO_FIELD_NAME, COMPANY_LOGO_MAX_SIZE } from "../../../company";
import { AuthController } from "./auth-controller";
import { CREATE_COMPANY_FORM_FIELDS } from "./auth-schemas";

export function authRouter(): Router {
  const router = Router();
  const controller = container.resolve(AuthController);

  router.post("/sign-up/verification-code", controller.sendEmailVerification);
  router.post("/sign-up/verify-email", controller.verifyEmail);
  router.post("/sign-up", controller.signUp);
  router.post("/login", controller.login);
  router.post("/forgot-password", controller.forgotPassword);
  router.post("/reset-password", controller.resetPassword);
  router.post("/select-company", ensureAuthenticated, controller.selectCompany);
  router.get("/me", ensureAuthenticated, controller.me);
  router.patch("/me", ensureAuthenticated, controller.updateProfile);
  router.patch("/me/password", ensureAuthenticated, controller.changePassword);
  router.post(
    "/companies",
    ensureAuthenticated,
    uploadSingleFile(COMPANY_LOGO_FIELD_NAME, COMPANY_LOGO_MAX_SIZE, {
      maxFields: CREATE_COMPANY_FORM_FIELDS,
    }),
    controller.createCompany,
  );

  return router;
}
