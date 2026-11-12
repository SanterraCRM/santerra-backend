import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateWalletUseCase } from "../../application/use-cases/create-wallet-use-case";
import { CreditWalletUseCase } from "../../application/use-cases/credit-wallet-use-case";
import { DeleteWalletUseCase } from "../../application/use-cases/delete-wallet-use-case";
import { GetWalletUseCase } from "../../application/use-cases/get-wallet-use-case";
import { ListWalletsUseCase } from "../../application/use-cases/list-wallets-use-case";
import { UpdateWalletUseCase } from "../../application/use-cases/update-wallet-use-case";
import {
  createWalletSchema,
  creditWalletSchema,
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
    private readonly creditWalletUseCase: CreditWalletUseCase,
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

  credit: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const wallet = await this.creditWalletUseCase.execute(
      id,
      creditWalletSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(wallet);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteWalletUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
