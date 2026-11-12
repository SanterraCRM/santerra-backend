import { inject, injectable } from "tsyringe";

import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import { PermissionProps } from "../../domain/entities/permission";
import {
  PERMISSION_REPOSITORY,
  PermissionRepository,
} from "../../domain/repositories/permission-repository";
import { ListPermissionsDto } from "../dtos/list-permissions-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListPermissionsUseCase {
  constructor(
    @inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(input: ListPermissionsDto): Promise<PaginatedDto<PermissionProps>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.permissionRepository.findMany({
      page,
      limit,
      search,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.permissions.map((permission) => permission.toObject()),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
