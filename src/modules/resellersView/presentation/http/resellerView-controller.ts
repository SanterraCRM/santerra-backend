import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { idParamSchema } from "../../../../shared/http/request-schemas";
import { GetResellerViewUseCase } from "../../application/use-cases/get-resellerView-use-case";
import { ListResellersViewUseCase } from "../../application/use-cases/list-resellersView-use-case";
import { listResellersViewQuerySchema } from "./resellerView-schemas";

@injectable()
export class ResellerViewController {
  constructor(
    private readonly listResellersViewUseCase: ListResellersViewUseCase,
    private readonly getResellerViewUseCase: GetResellerViewUseCase,
  ) {}

  list: RequestHandler = async (request, response) => {
    const result = await this.listResellersViewUseCase.execute(
      listResellersViewQuerySchema.parse(request.query),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);

    const reseller = await this.getResellerViewUseCase.execute(
      Number(id),
    );

    response.status(200).json(reseller);
  };
}