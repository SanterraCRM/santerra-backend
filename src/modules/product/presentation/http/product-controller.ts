import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateProductUseCase } from "../../application/use-cases/create-product-use-case";
import { DeleteProductUseCase } from "../../application/use-cases/delete-product-use-case";
import { GetProductUseCase } from "../../application/use-cases/get-product-use-case";
import { ListProductsUseCase } from "../../application/use-cases/list-products-use-case";
import { UpdateProductUseCase } from "../../application/use-cases/update-product-use-case";
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "./product-schemas";

@injectable()
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const product = await this.createProductUseCase.execute(
      createProductSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(product);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listProductsUseCase.execute(
      listProductsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const product = await this.getProductUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(product);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const product = await this.updateProductUseCase.execute(
      id,
      updateProductSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(product);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteProductUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
