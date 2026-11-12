import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ConflictError } from "../../../../shared/errors/app-error";
import { Group } from "../../domain/entities/group";
import {
  GROUP_REPOSITORY,
  GroupRepository,
} from "../../domain/repositories/group-repository";
import { CreateGroupDto } from "../dtos/create-group-dto";
import { GroupDetailsDto, toGroupDetailsDto } from "../dtos/group-details-dto";

@injectable()
export class CreateGroupUseCase {
  constructor(
    @inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(
    input: CreateGroupDto,
    context: TenantContext,
  ): Promise<GroupDetailsDto> {
    const group = Group.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    if (await this.groupRepository.findByName(group.name, context.companyId)) {
      throw new ConflictError("Já existe um grupo com este nome.");
    }

    const createdGroup = await this.groupRepository.create(group);

    return toGroupDetailsDto(createdGroup);
  }
}
