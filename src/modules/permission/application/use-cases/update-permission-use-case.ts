import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { PermissionProps } from "../../domain/entities/permission";
import {
  PERMISSION_REPOSITORY,
  PermissionRepository,
} from "../../domain/repositories/permission-repository";
import { UpdatePermissionDto } from "../dtos/update-permission-dto";

@injectable()
export class UpdatePermissionUseCase {
  constructor(
    @inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(id: string, input: UpdatePermissionDto): Promise<PermissionProps> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new ResourceNotFoundError("Permissão não encontrada.");
    }

    permission.update(input);
    const updatedPermission = await this.permissionRepository.update(permission);

    return updatedPermission.toObject();
  }
}
