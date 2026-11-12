import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateEventUseCase } from "../../application/use-cases/create-event-use-case";
import { DeleteEventUseCase } from "../../application/use-cases/delete-event-use-case";
import { GetEventUseCase } from "../../application/use-cases/get-event-use-case";
import { ListEventsUseCase } from "../../application/use-cases/list-events-use-case";
import { UpdateEventUseCase } from "../../application/use-cases/update-event-use-case";
import {
  createEventSchema,
  listEventsQuerySchema,
  updateEventSchema,
} from "./event-schemas";

@injectable()
export class EventController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly getEventUseCase: GetEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const event = await this.createEventUseCase.execute(
      createEventSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(event);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listEventsUseCase.execute(
      listEventsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const event = await this.getEventUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(event);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const event = await this.updateEventUseCase.execute(
      id,
      updateEventSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(event);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteEventUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
