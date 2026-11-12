import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { PermissionProps } from "../../domain/entities/permission";
import {
  PERMISSION_REPOSITORY,
  PermissionRepository,
} from "../../domain/repositories/permission-repository";

@injectable()
export class GetPermissionUseCase {
  constructor(
    @inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(id: string): Promise<PermissionProps> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new ResourceNotFoundError("Permissão não encontrada.");
    }

    return permission.toObject();
  }
}
