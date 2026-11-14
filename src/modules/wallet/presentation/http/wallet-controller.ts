import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { AdjustWalletUseCase } from "../../application/use-cases/adjust-wallet-use-case";
import { CreateWalletUseCase } from "../../application/use-cases/create-wallet-use-case";
import { DeleteWalletUseCase } from "../../application/use-cases/delete-wallet-use-case";
import { GetWalletUseCase } from "../../application/use-cases/get-wallet-use-case";
import { ListWalletMovementsUseCase } from "../../application/use-cases/list-wallet-movements-use-case";
import { ListWalletsUseCase } from "../../application/use-cases/list-wallets-use-case";
import { SummarizeWalletMovementsUseCase } from "../../application/use-cases/summarize-wallet-movements-use-case";
import { UpdateWalletUseCase } from "../../application/use-cases/update-wallet-use-case";
import {
  adjustWalletSchema,
  createWalletSchema,
  listWalletMovementsQuerySchema,
  listWalletsQuerySchema,
  updateWalletSchema,
} from "./wallet-schemas";

@injectable()
export class WalletController {
  constructor(
    private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly listWalletsUseCase: ListWalletsUseCase,
    private readonly getWalletUseCase: GetWalletUseCase,
    private readonly updateWalletUseCase: UpdateWalletUseCase,
    private readonly deleteWalletUseCase: DeleteWalletUseCase,
    private readonly adjustWalletUseCase: AdjustWalletUseCase,
    private readonly listWalletMovementsUseCase: ListWalletMovementsUseCase,
    private readonly summarizeWalletMovementsUseCase: SummarizeWalletMovementsUseCase,
  ) {}

  create: RequestHandler = async (request, response) => {
    const wallet = await this.createWalletUseCase.execute(
      createWalletSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(wallet);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listWalletsUseCase.execute(
      listWalletsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const wallet = await this.getWalletUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(wallet);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const wallet = await this.updateWalletUseCase.execute(
      id,
      updateWalletSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(wallet);
  };

  adjust: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const wallet = await this.adjustWalletUseCase.execute(
      id,
      adjustWalletSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(wallet);
  };

  listMovements: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await this.listWalletMovementsUseCase.execute(
      id,
      listWalletMovementsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  summarizeMovements: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const summary = await this.summarizeWalletMovementsUseCase.execute(
      id,
      listWalletMovementsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(summary);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteWalletUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
