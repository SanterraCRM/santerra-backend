import { inject, injectable } from "tsyringe";

import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import { PublicUserProps } from "../../domain/entities/user";
import {
  USER_REPOSITORY,
  UserRepository,
} from "../../domain/repositories/user-repository";
import { ListUsersDto } from "../dtos/list-users-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListUsersUseCase {
  constructor(
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: ListUsersDto): Promise<PaginatedDto<PublicUserProps>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.userRepository.findMany({
      page,
      limit,
      search,
      active: input.active,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.users.map((user) => user.toPublicObject()),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
