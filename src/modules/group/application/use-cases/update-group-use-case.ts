import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ConflictError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import {
  GROUP_REPOSITORY,
  GroupRepository,
} from "../../domain/repositories/group-repository";
import { GroupDetailsDto, toGroupDetailsDto } from "../dtos/group-details-dto";
import { UpdateGroupDto } from "../dtos/update-group-dto";

@injectable()
export class UpdateGroupUseCase {
  constructor(
    @inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateGroupDto,
    context: TenantContext,
  ): Promise<GroupDetailsDto> {
    const group = await this.groupRepository.findById(id, context.companyId);

    if (!group) {
      throw new ResourceNotFoundError("Grupo não encontrado.");
    }

    group.update({ ...input, updatedById: context.userId });

    if (input.name !== undefined) {
      const owner = await this.groupRepository.findByName(group.name, context.companyId);

      if (owner && owner.id !== group.id) {
        throw new ConflictError("Já existe um grupo com este nome.");
      }
    }

    const updatedGroup = await this.groupRepository.update(group);

    return toGroupDetailsDto(updatedGroup);
  }
}
