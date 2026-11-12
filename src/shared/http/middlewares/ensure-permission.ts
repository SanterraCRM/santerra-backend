import { RequestHandler } from "express";

import { PermissionName } from "../../application/auth/permissions";
import { ForbiddenError } from "../../errors/app-error";

export function ensurePermission(permission: PermissionName): RequestHandler {
  return (request, _response, next) => {
    if (!request.tenant?.permissions.includes(permission)) {
      throw new ForbiddenError("Você não tem permissão para esta ação.");
    }

    next();
  };
}
