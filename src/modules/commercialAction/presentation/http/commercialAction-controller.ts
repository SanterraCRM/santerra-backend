import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateCommercialActionUseCase } from "../../application/use-cases/create-commercialAction-use-case";
import { DeleteCommercialActionUseCase } from "../../application/use-cases/delete-commercialAction-use-case";
import { GetCommercialActionUseCase } from "../../application/use-cases/get-commercialAction-use-case";
import { ListCommercialActionsUseCase } from "../../application/use-cases/list-commercialActions-use-case";
import { UpdateCommercialActionUseCase } from "../../application/use-cases/update-commercialAction-use-case";
import {
  createCommercialActionSchema,
  listCommercialActionsQuerySchema,
  updateCommercialActionSchema,
} from "./commercialAction-schemas";

@injectable()
export class CommercialActionController {
  constructor(
    private readonly createCommercialActionUseCase: CreateCommercialActionUseCase,
    private readonly listCommercialActionsUseCase: ListCommercialActionsUseCase,
    private readonly getCommercialActionUseCase: GetCommercialActionUseCase,
    private readonly updateCommercialActionUseCase: UpdateCommercialActionUseCase,
    private readonly deleteCommercialActionUseCase: DeleteCommercialActionUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const commercialAction = await this.createCommercialActionUseCase.execute(
      createCommercialActionSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(commercialAction);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listCommercialActionsUseCase.execute(
      listCommercialActionsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const commercialAction = await this.getCommercialActionUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(commercialAction);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const commercialAction = await this.updateCommercialActionUseCase.execute(
      id,
      updateCommercialActionSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(commercialAction);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteCommercialActionUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
