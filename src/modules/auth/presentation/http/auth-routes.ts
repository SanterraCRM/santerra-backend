import { Router } from "express";
import { container } from "tsyringe";

import { ensureAuthenticated } from "../../../../shared/http/middlewares/ensure-authenticated";
import { AuthController } from "./auth-controller";

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
  router.post("/companies", ensureAuthenticated, controller.createCompany);

  return router;
}
