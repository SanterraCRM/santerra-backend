import { RequestHandler } from "express";

import { ForbiddenError } from "../../errors/app-error";

export const ensureTenant: RequestHandler = (request, _response, next) => {
  if (!request.tenant) {
    throw new ForbiddenError("Selecione uma empresa para acessar este recurso.");
  }

  next();
};
