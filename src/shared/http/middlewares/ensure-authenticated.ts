import { RequestHandler } from "express";
import { container } from "tsyringe";

import {
  AUTHENTICATOR,
  Authenticator,
} from "../../application/auth/authenticator";
import { UnauthorizedError } from "../../errors/app-error";

const BEARER_PREFIX = "Bearer ";

export const ensureAuthenticated: RequestHandler = async (request, _response, next) => {
  const header = request.headers.authorization;

  if (!header?.startsWith(BEARER_PREFIX)) {
    throw new UnauthorizedError("Token de acesso não informado.");
  }

  const authenticator = container.resolve<Authenticator>(AUTHENTICATOR);
  const { auth, tenant } = await authenticator.execute(
    header.slice(BEARER_PREFIX.length).trim(),
  );

  request.auth = auth;
  request.tenant = tenant ?? undefined;
  next();
};
