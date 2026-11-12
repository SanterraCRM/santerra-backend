import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  PRODUCER_REPOSITORY,
  ProducerRepository,
} from "../../domain/repositories/producer-repository";
import { ListProducersDto } from "../dtos/list-producers-dto";
import { ProducerListItemDto } from "../dtos/producer-list-item-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListProducersUseCase {
  constructor(
    @inject(PRODUCER_REPOSITORY)
    private readonly producerRepository: ProducerRepository,
  ) {}

  async execute(
    input: ListProducersDto,
    context: TenantContext,
  ): Promise<PaginatedDto<ProducerListItemDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.producerRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      potentialId: input.potentialId,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.producers.map(({ producer, person }) => ({
        ...producer.toObject(),
        person,
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
