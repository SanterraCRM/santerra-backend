import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreatePotentialUseCase } from "../../application/use-cases/create-potential-use-case";
import { DeletePotentialUseCase } from "../../application/use-cases/delete-potential-use-case";
import { GetPotentialUseCase } from "../../application/use-cases/get-potential-use-case";
import { ListPotentialsUseCase } from "../../application/use-cases/list-potentials-use-case";
import { UpdatePotentialUseCase } from "../../application/use-cases/update-potential-use-case";
import {
  createPotentialSchema,
  listPotentialsQuerySchema,
  updatePotentialSchema,
} from "./potential-schemas";

@injectable()
export class PotentialController {
  constructor(
    private readonly createPotentialUseCase: CreatePotentialUseCase,
    private readonly listPotentialsUseCase: ListPotentialsUseCase,
    private readonly getPotentialUseCase: GetPotentialUseCase,
    private readonly updatePotentialUseCase: UpdatePotentialUseCase,
    private readonly deletePotentialUseCase: DeletePotentialUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const potential = await this.createPotentialUseCase.execute(
      createPotentialSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(potential);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listPotentialsUseCase.execute(
      listPotentialsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const potential = await this.getPotentialUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(potential);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const potential = await this.updatePotentialUseCase.execute(
      id,
      updatePotentialSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(potential);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deletePotentialUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
