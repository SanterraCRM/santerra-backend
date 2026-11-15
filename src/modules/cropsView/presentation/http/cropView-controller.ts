import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { idParamSchema } from "../../../../shared/http/request-schemas";
import { GetCropViewUseCase } from "../../application/use-cases/get-cropView-use-case";
import { ListCropsViewUseCase } from "../../application/use-cases/list-cropsView-use-case";
import { listCropsViewQuerySchema } from "./cropView-schemas";

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
    const { id } = idParamSchema.parse(request.params);

    const reseller = await this.getCropViewUseCase.execute(
      Number(id),
    );

    response.status(200).json(reseller);
  };
}