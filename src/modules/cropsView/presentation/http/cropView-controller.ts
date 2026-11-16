import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { GetCropViewUseCase } from "../../application/use-cases/get-cropView-use-case";
import { ListCropsViewUseCase } from "../../application/use-cases/list-cropsView-use-case";
import {
  cropViewParamsSchema,
  cropViewQuerySchema,
  listCropsViewQuerySchema,
} from "./cropView-schemas";

@injectable()
export class CropViewController {
  constructor(
    private readonly listCropsViewUseCase: ListCropsViewUseCase,
    private readonly getCropViewUseCase: GetCropViewUseCase,
  ) {}

  list: RequestHandler = async (request, response) => {
    const result = await this.listCropsViewUseCase.execute(
      listCropsViewQuerySchema.parse(request.query),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { productId } = cropViewParamsSchema.parse(request.params);
    const { crop } = cropViewQuerySchema.parse(request.query);

    const cropView = await this.getCropViewUseCase.execute(productId, crop);

    response.status(200).json(cropView);
  };
}
