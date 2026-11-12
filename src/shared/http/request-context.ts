import { Request } from "express";

import {
  AuthContext,
  TenantContext,
} from "../application/auth/auth-context";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error";

export function getAuthContext(request: Request): AuthContext {
  if (!request.auth) {
    throw new UnauthorizedError("Token de acesso não informado.");
  }

  return request.auth;
}

export function getTenantContext(request: Request): TenantContext {
  if (!request.tenant) {
    throw new ForbiddenError("Selecione uma empresa para acessar este recurso.");
  }

  return request.tenant;
}
