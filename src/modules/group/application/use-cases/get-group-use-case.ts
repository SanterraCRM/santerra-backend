import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  GROUP_REPOSITORY,
  GroupRepository,
} from "../../domain/repositories/group-repository";
import { GroupDetailsDto, toGroupDetailsDto } from "../dtos/group-details-dto";

@injectable()
export class GetGroupUseCase {
  constructor(
    @inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<GroupDetailsDto> {
    const group = await this.groupRepository.findDetailsById(id, context.companyId);

    if (!group) {
      throw new ResourceNotFoundError("Grupo não encontrado.");
    }

    return toGroupDetailsDto(group);
  }
}
