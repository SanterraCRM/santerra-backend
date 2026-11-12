import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ForbiddenError } from "../../../../shared/errors/app-error";
import {
  PERMISSION_REPOSITORY,
  PermissionRepository,
} from "../../domain/repositories/permission-repository";

@injectable()
export class PermissionScope {
  constructor(
    @inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async ensureWithin(permissionIds: string[], context: TenantContext): Promise<void> {
    if (permissionIds.length === 0) {
      return;
    }

    const requested = new Set(permissionIds);
    const allowed = new Set(context.permissions);
    const permissions = await this.permissionRepository.findAll();
    const outOfScope = permissions.some(
      (permission) => requested.has(permission.id) && !allowed.has(permission.name),
    );

    if (outOfScope) {
      throw new ForbiddenError(
        "Você não pode gerenciar cargos com permissões que você não tem.",
      );
    }
  }
}
