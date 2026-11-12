import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  GROUP_REPOSITORY,
  GroupRepository,
} from "../../domain/repositories/group-repository";
import { GroupDetailsDto, toGroupDetailsDto } from "../dtos/group-details-dto";
import { ListGroupsDto } from "../dtos/list-groups-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListGroupsUseCase {
  constructor(
    @inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(
    input: ListGroupsDto,
    context: TenantContext,
  ): Promise<PaginatedDto<GroupDetailsDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.groupRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      createdFrom: input.createdFrom,
      createdTo: input.createdTo,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.groups.map(toGroupDetailsDto),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
