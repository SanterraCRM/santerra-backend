import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateCommercialTripUseCase } from "../../application/use-cases/create-commercialTrip-use-case";
import { DeleteCommercialTripUseCase } from "../../application/use-cases/delete-commercialTrip-use-case";
import { GetCommercialTripUseCase } from "../../application/use-cases/get-commercialTrip-use-case";
import { ListCommercialTripsUseCase } from "../../application/use-cases/list-commercialTrips-use-case";
import { UpdateCommercialTripUseCase } from "../../application/use-cases/update-commercialTrip-use-case";
import {
  createCommercialTripSchema,
  listCommercialTripsQuerySchema,
  updateCommercialTripSchema,
} from "./commercialTrip-schemas";

@injectable()
export class CommercialTripController {
  constructor(
    private readonly createCommercialTripUseCase: CreateCommercialTripUseCase,
    private readonly listCommercialTripsUseCase: ListCommercialTripsUseCase,
    private readonly getCommercialTripUseCase: GetCommercialTripUseCase,
    private readonly updateCommercialTripUseCase: UpdateCommercialTripUseCase,
    private readonly deleteCommercialTripUseCase: DeleteCommercialTripUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const commercialTrip = await this.createCommercialTripUseCase.execute(
      createCommercialTripSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(commercialTrip);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listCommercialTripsUseCase.execute(
      listCommercialTripsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const commercialTrip = await this.getCommercialTripUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(commercialTrip);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const commercialTrip = await this.updateCommercialTripUseCase.execute(
      id,
      updateCommercialTripSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(commercialTrip);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteCommercialTripUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
