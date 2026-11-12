import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  PERMISSION_REPOSITORY,
  PermissionRepository,
} from "../../domain/repositories/permission-repository";

@injectable()
export class DeletePermissionUseCase {
  constructor(
    @inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) { }

  async execute(id: string): Promise<void> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new ResourceNotFoundError("Permissão não encontrada.");
    }
    
    await this.permissionRepository.delete(permission);
  }
}
