import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ConflictError } from "../../../../shared/errors/app-error";
import { Event, EventProps } from "../../domain/entities/event";
import {
  EVENT_REPOSITORY,
  EventRepository,
} from "../../domain/repositories/event-repository";
import { CreateEventDto } from "../dtos/create-event-dto";

export const EVENT_NAME_CONFLICT_MESSAGE = "Já existe um evento com este nome.";

@injectable()
export class CreateEventUseCase {
  constructor(
    @inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(
    input: CreateEventDto,
    context: TenantContext,
  ): Promise<EventProps> {
    const event = Event.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    if (await this.eventRepository.findByName(event.name, context.companyId)) {
      throw new ConflictError(EVENT_NAME_CONFLICT_MESSAGE);
    }

    const createdEvent = await this.eventRepository.create(event);

    return createdEvent.toObject();
  }
}
