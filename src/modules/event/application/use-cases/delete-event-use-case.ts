import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  ResourceInUseError,
  ResourceNotFoundError,
} from "../../../../shared/errors/app-error";
import {
  EVENT_REPOSITORY,
  EventRepository,
} from "../../domain/repositories/event-repository";

@injectable()
export class DeleteEventUseCase {
  constructor(
    @inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<void> {
    const event = await this.eventRepository.findById(id, context.companyId);

    if (!event) {
      throw new ResourceNotFoundError("Evento não encontrado.");
    }

    const actionsCount = await this.eventRepository.countActions(
      event.id,
      context.companyId,
    );

    if (actionsCount > 0) {
      const actions =
        actionsCount === 1 ? "1 ação comercial" : `${actionsCount} ações comerciais`;

      throw new ResourceInUseError(`Este evento está em uso por ${actions}.`);
    }

    event.delete(context.userId);
    await this.eventRepository.delete(event);
  }
}
