import { inject, injectable } from "tsyringe";

import { Permission, PermissionProps } from "../../domain/entities/permission";
import {
  PERMISSION_REPOSITORY,
  PermissionRepository,
} from "../../domain/repositories/permission-repository";
import { CreatePermissionDto } from "../dtos/create-permission-dto";

@injectable()
export class CreatePermissionUseCase {
  constructor(
    @inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(input: CreatePermissionDto): Promise<PermissionProps> {
    const permission = Permission.create(input);
    const createdPermission = await this.permissionRepository.create(permission);

    return createdPermission.toObject();
  }
}
