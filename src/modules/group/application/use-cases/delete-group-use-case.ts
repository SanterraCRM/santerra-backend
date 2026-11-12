import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  GROUP_REPOSITORY,
  GroupRepository,
} from "../../domain/repositories/group-repository";

@injectable()
export class DeleteGroupUseCase {
  constructor(
    @inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const group = await this.groupRepository.findById(id, context.companyId);

    if (!group) {
      throw new ResourceNotFoundError("Grupo não encontrado.");
    }

    group.delete(context.userId);
    await this.groupRepository.delete(group);
  }
}
