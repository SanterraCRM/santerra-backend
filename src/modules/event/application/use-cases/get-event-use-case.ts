import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { EventProps } from "../../domain/entities/event";
import {
  EVENT_REPOSITORY,
  EventRepository,
} from "../../domain/repositories/event-repository";

@injectable()
export class GetEventUseCase {
  constructor(
    @inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<EventProps> {
    const event = await this.eventRepository.findById(id, context.companyId);

    if (!event) {
      throw new ResourceNotFoundError("Evento não encontrado.");
    }

    return event.toObject();
  }
}
