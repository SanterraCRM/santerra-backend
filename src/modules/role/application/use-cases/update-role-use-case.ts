import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import { PermissionScope } from "../../../permission";
import { RoleProps } from "../../domain/entities/role";
import {
  ROLE_REPOSITORY,
  RoleRepository,
} from "../../domain/repositories/role-repository";
import { UpdateRoleDto } from "../dtos/update-role-dto";

@injectable()
export class UpdateRoleUseCase {
  constructor(
    @inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    private readonly permissionScope: PermissionScope,
  ) {}

  async execute(
    id: string,
    input: UpdateRoleDto,
    context: TenantContext,
  ): Promise<RoleProps> {
    const role = await this.roleRepository.findById(id, context.companyId);

    if (!role) {
      throw new ResourceNotFoundError("Cargo não encontrado.");
    }

    const previousPermissionIds = role.permissionIds;
    role.update({ ...input, updatedById: context.userId });
    await this.permissionScope.ensureWithin(
      [...previousPermissionIds, ...role.permissionIds],
      context,
    );

    const owner = await this.roleRepository.findByName(
      role.name,
      context.companyId,
    );

    if (owner && owner.id !== role.id) {
      throw new ConflictError("Já existe um cargo com este nome.");
    }

    const updatedRole = await this.roleRepository.update(role);

    return updatedRole.toObject();
  }
}
