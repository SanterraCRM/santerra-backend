import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ConflictError } from "../../../../shared/errors/app-error";
import { PermissionScope } from "../../../permission";
import { Role, RoleProps } from "../../domain/entities/role";
import {
  ROLE_REPOSITORY,
  RoleRepository,
} from "../../domain/repositories/role-repository";
import { CreateRoleDto } from "../dtos/create-role-dto";

@injectable()
export class CreateRoleUseCase {
  constructor(
    @inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    private readonly permissionScope: PermissionScope,
  ) {}

  async execute(input: CreateRoleDto, context: TenantContext): Promise<RoleProps> {
    const role = Role.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    await this.permissionScope.ensureWithin(role.permissionIds, context);

    if (await this.roleRepository.findByName(role.name, context.companyId)) {
      throw new ConflictError("Já existe um cargo com este nome.");
    }

    const createdRole = await this.roleRepository.create(role);

    return createdRole.toObject();
  }
}
