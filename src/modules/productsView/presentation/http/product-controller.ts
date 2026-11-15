import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { idParamSchema } from "../../../../shared/http/request-schemas";
import { GetProductViewUseCase } from "../../application/use-cases/get-productView-use-case";
import { ListProductsViewUseCase } from "../../application/use-cases/list-productsView-use-case";
import { listProductsViewQuerySchema } from "./productView-schemas";

@injectable()
export class ProductViewController {
  constructor(
    private readonly listProductsViewUseCase: ListProductsViewUseCase,
    private readonly getProductViewUseCase: GetProductViewUseCase,
  ) {}

  list: RequestHandler = async (request, response) => {
    const result = await this.listProductsViewUseCase.execute(
      listProductsViewQuerySchema.parse(request.query),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);

    const product = await this.getProductViewUseCase.execute(
      Number(id),
    );

    response.status(200).json(product);
  };
}