import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  EVENT_REPOSITORY,
  EventRepository,
} from "../../domain/repositories/event-repository";
import { EventListItemDto } from "../dtos/event-list-item-dto";
import { ListEventsDto } from "../dtos/list-events-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListEventsUseCase {
  constructor(
    @inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(
    input: ListEventsDto,
    context: TenantContext,
  ): Promise<PaginatedDto<EventListItemDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.eventRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      createdFrom: input.createdFrom,
      createdTo: input.createdTo,
      sort: input.sort,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.events.map(({ event, actionsCount }) => ({
        ...event.toObject(),
        actionsCount,
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
