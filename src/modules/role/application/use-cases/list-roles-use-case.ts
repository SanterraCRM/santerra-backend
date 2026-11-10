import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  ROLE_REPOSITORY,
  RoleRepository,
} from "../../domain/repositories/role-repository";
import { ListRolesDto } from "../dtos/list-roles-dto";
import { RoleListItemDto } from "../dtos/role-list-item-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListRolesUseCase {
  constructor(
    @inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(
    input: ListRolesDto,
    context: TenantContext,
  ): Promise<PaginatedDto<RoleListItemDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.roleRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      createdFrom: input.createdFrom,
      createdTo: input.createdTo,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.roles.map(({ role, membersCount }) => ({
        ...role.toObject(),
        membersCount,
      })),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
