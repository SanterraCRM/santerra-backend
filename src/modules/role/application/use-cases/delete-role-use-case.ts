import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ResourceInUseError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PermissionScope } from "../../../permission";
import {
  ROLE_REPOSITORY,
  RoleRepository,
} from "../../domain/repositories/role-repository";

@injectable()
export class DeleteRoleUseCase {
  constructor(
    @inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    private readonly permissionScope: PermissionScope,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const role = await this.roleRepository.findById(id, context.companyId);

    if (!role) {
      throw new ResourceNotFoundError("Cargo não encontrado.");
    }

    await this.permissionScope.ensureWithin(role.permissionIds, context);

    const membersCount = await this.roleRepository.countMembers(role.id, context.companyId);

    if (membersCount > 0) {
      const members = membersCount === 1 ? "1 membro" : `${membersCount} membros`;

      throw new ResourceInUseError(`Este cargo está atribuído a ${members}.`);
    }

    role.delete(context.userId);
    await this.roleRepository.delete(role);
  }
}
