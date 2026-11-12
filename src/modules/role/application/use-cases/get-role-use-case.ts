import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { RoleProps } from "../../domain/entities/role";
import {
  ROLE_REPOSITORY,
  RoleRepository,
} from "../../domain/repositories/role-repository";

@injectable()
export class GetRoleUseCase {
  constructor(
    @inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<RoleProps> {
    const role = await this.roleRepository.findById(id, context.companyId);

    if (!role) {
      throw new ResourceNotFoundError("Cargo não encontrado.");
    }

    return role.toObject();
  }
}
