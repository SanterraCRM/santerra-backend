import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  POTENTIAL_REPOSITORY,
  PotentialRepository,
} from "../../domain/repositories/potential-repository";
import { ListPotentialsDto } from "../dtos/list-potentials-dto";
import { PotentialListItemDto } from "../dtos/potential-list-item-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListPotentialsUseCase {
  constructor(
    @inject(POTENTIAL_REPOSITORY)
    private readonly potentialRepository: PotentialRepository,
  ) {}

  async execute(
    input: ListPotentialsDto,
    context: TenantContext,
  ): Promise<PaginatedDto<PotentialListItemDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.potentialRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      createdFrom: input.createdFrom,
      createdTo: input.createdTo,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.potentials.map(({ potential, producersCount }) => ({
        ...potential.toObject(),
        producersCount,
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
