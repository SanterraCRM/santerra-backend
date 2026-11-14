import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ConflictError, ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { EventProps } from "../../domain/entities/event";
import {
  EVENT_REPOSITORY,
  EventRepository,
} from "../../domain/repositories/event-repository";
import { UpdateEventDto } from "../dtos/update-event-dto";
import { EVENT_NAME_CONFLICT_MESSAGE } from "./create-event-use-case";

@injectable()
export class UpdateEventUseCase {
  constructor(
    @inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateEventDto,
    context: TenantContext,
  ): Promise<EventProps> {
    const event = await this.eventRepository.findById(id, context.companyId);

    if (!event) {
      throw new ResourceNotFoundError("Tipo de evento não encontrado.");
    }

    event.update({ ...input, updatedById: context.userId });

    if (input.name !== undefined) {
      const owner = await this.eventRepository.findByName(event.name, context.companyId);

      if (owner && owner.id !== event.id) {
        throw new ConflictError(EVENT_NAME_CONFLICT_MESSAGE);
      }
    }

    const updatedEvent = await this.eventRepository.update(event);

    return updatedEvent.toObject();
  }
}
