import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getAuthContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateManufacturerUseCase } from "../../application/use-cases/create-manufacturer-use-case";
import { DeleteManufacturerUseCase } from "../../application/use-cases/delete-manufacturer-use-case";
import { GetManufacturerUseCase } from "../../application/use-cases/get-manufacturer-use-case";
import { ListManufacturersUseCase } from "../../application/use-cases/list-manufacturers-use-case";
import { UpdateManufacturerUseCase } from "../../application/use-cases/update-manufacturer-use-case";
import {
  createManufacturerSchema,
  listManufacturersQuerySchema,
  updateManufacturerSchema,
} from "./manufacturer-schemas";

@injectable()
export class ManufacturerController {
  constructor(
    private readonly createManufacturerUseCase: CreateManufacturerUseCase,
    private readonly listManufacturersUseCase: ListManufacturersUseCase,
    private readonly getManufacturerUseCase: GetManufacturerUseCase,
    private readonly updateManufacturerUseCase: UpdateManufacturerUseCase,
    private readonly deleteManufacturerUseCase: DeleteManufacturerUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const manufacturer = await this.createManufacturerUseCase.execute(
      createManufacturerSchema.parse(request.body),
      getAuthContext(request),
    );

    response.status(201).json(manufacturer);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listManufacturersUseCase.execute(
      listManufacturersQuerySchema.parse(request.query),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const manufacturer = await this.getManufacturerUseCase.execute(id);

    response.status(200).json(manufacturer);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const manufacturer = await this.updateManufacturerUseCase.execute(
      id,
      updateManufacturerSchema.parse(request.body),
      getAuthContext(request),
    );

    response.status(200).json(manufacturer);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteManufacturerUseCase.execute(id, getAuthContext(request));

    response.status(204).send();
  };
}
