import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateProducerUseCase } from "../../application/use-cases/create-producer-use-case";
import { DeleteProducerUseCase } from "../../application/use-cases/delete-producer-use-case";
import { GetProducerUseCase } from "../../application/use-cases/get-producer-use-case";
import { ListProducersUseCase } from "../../application/use-cases/list-producers-use-case";
import { UpdateProducerUseCase } from "../../application/use-cases/update-producer-use-case";
import {
  createProducerSchema,
  listProducersQuerySchema,
  updateProducerSchema,
} from "./producer-schemas";

@injectable()
export class ProducerController {
  constructor(
    private readonly createProducerUseCase: CreateProducerUseCase,
    private readonly listProducersUseCase: ListProducersUseCase,
    private readonly getProducerUseCase: GetProducerUseCase,
    private readonly updateProducerUseCase: UpdateProducerUseCase,
    private readonly deleteProducerUseCase: DeleteProducerUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const producer = await this.createProducerUseCase.execute(
      createProducerSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(producer);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listProducersUseCase.execute(
      listProducersQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const producer = await this.getProducerUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(producer);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const producer = await this.updateProducerUseCase.execute(
      id,
      updateProducerSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(producer);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteProducerUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
