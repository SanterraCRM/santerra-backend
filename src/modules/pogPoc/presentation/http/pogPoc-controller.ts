import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { GetPogPocFilterOptionsUseCase } from "../../application/use-cases/get-pogPoc-filter-options-use-case";
import { GetPogPocUseCase } from "../../application/use-cases/get-pogPoc-use-case";
import { ListPogPocsUseCase } from "../../application/use-cases/list-pogPoc-use-case";
import { listPogPocsQuerySchema, pogPocIdParamSchema } from "./pogPoc-schemas";

@injectable()
export class PogPocController {
  constructor(
    private readonly listPogPocsUseCase: ListPogPocsUseCase,
    private readonly getPogPocUseCase: GetPogPocUseCase,
    private readonly getPogPocFilterOptionsUseCase: GetPogPocFilterOptionsUseCase,
  ) {}

  list: RequestHandler = async (request, response) => {
    const result = await this.listPogPocsUseCase.execute(
      listPogPocsQuerySchema.parse(request.query),
    );

    response.status(200).json(result);
  };

  filterOptions: RequestHandler = async (_request, response) => {
    const options = await this.getPogPocFilterOptionsUseCase.execute();

    response.status(200).json(options);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = pogPocIdParamSchema.parse(request.params);

    const pogPocs = await this.getPogPocUseCase.execute(id);

    response.status(200).json(pogPocs);
  };
}
