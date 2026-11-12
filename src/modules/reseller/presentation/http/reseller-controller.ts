import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateResellerUseCase } from "../../application/use-cases/create-reseller-use-case";
import { DeleteResellerUseCase } from "../../application/use-cases/delete-reseller-use-case";
import { GetResellerUseCase } from "../../application/use-cases/get-reseller-use-case";
import { ListResellersUseCase } from "../../application/use-cases/list-resellers-use-case";
import { UpdateResellerUseCase } from "../../application/use-cases/update-reseller-use-case";
import {
  createResellerSchema,
  listResellersQuerySchema,
  updateResellerSchema,
} from "./reseller-schemas";

@injectable()
export class ResellerController {
  constructor(
    private readonly createResellerUseCase: CreateResellerUseCase,
    private readonly listResellersUseCase: ListResellersUseCase,
    private readonly getResellerUseCase: GetResellerUseCase,
    private readonly updateResellerUseCase: UpdateResellerUseCase,
    private readonly deleteResellerUseCase: DeleteResellerUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const reseller = await this.createResellerUseCase.execute(
      createResellerSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(reseller);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listResellersUseCase.execute(
      listResellersQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const reseller = await this.getResellerUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(reseller);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const reseller = await this.updateResellerUseCase.execute(
      id,
      updateResellerSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(reseller);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteResellerUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
