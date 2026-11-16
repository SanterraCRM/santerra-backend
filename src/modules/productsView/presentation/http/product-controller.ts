import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { GetProductViewFilterOptionsUseCase } from "../../application/use-cases/get-productView-filter-options-use-case";
import { GetProductViewUseCase } from "../../application/use-cases/get-productView-use-case";
import { ListProductsViewUseCase } from "../../application/use-cases/list-productsView-use-case";
import {
  listProductsViewQuerySchema,
  productViewIdParamSchema,
} from "./productView-schemas";

@injectable()
export class ProductViewController {
  constructor(
    private readonly listProductsViewUseCase: ListProductsViewUseCase,
    private readonly getProductViewUseCase: GetProductViewUseCase,
    private readonly getProductViewFilterOptionsUseCase: GetProductViewFilterOptionsUseCase,
  ) {}

  list: RequestHandler = async (request, response) => {
    const result = await this.listProductsViewUseCase.execute(
      listProductsViewQuerySchema.parse(request.query),
    );

    response.status(200).json(result);
  };

  filterOptions: RequestHandler = async (_request, response) => {
    const options = await this.getProductViewFilterOptionsUseCase.execute();

    response.status(200).json(options);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = productViewIdParamSchema.parse(request.params);

    const product = await this.getProductViewUseCase.execute(id);

    response.status(200).json(product);
  };
}
