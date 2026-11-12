import { RequestHandler } from "express";

import { ForbiddenError } from "../../errors/app-error";

export const ensurePlatformAdmin: RequestHandler = (request, _response, next) => {
  if (!request.auth?.isPlatformAdmin) {
    throw new ForbiddenError("Acesso restrito à administração da plataforma.");
  }

  next();
};
