import { RequestHandler } from "express";
import { pipeline } from "node:stream/promises";
import { injectable } from "tsyringe";

import { ValidationError } from "../../../../shared/errors/app-error";
import {
  getAuthContext,
  getTenantContext,
} from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { CreateCompanyUseCase } from "../../application/use-cases/create-company-use-case";
import { DeactivateCompanyUseCase } from "../../application/use-cases/deactivate-company-use-case";
import { DeleteCompanyUseCase } from "../../application/use-cases/delete-company-use-case";
import { GetCompanyLogoUseCase } from "../../application/use-cases/get-company-logo-use-case";
import { GetCompanyUseCase } from "../../application/use-cases/get-company-use-case";
import { ListCompaniesUseCase } from "../../application/use-cases/list-companies-use-case";
import { RemoveCompanyLogoUseCase } from "../../application/use-cases/remove-company-logo-use-case";
import { UpdateCompanyLogoUseCase } from "../../application/use-cases/update-company-logo-use-case";
import { UpdateCompanyUseCase } from "../../application/use-cases/update-company-use-case";
import {
  COMPANY_LOGO_FIELD_NAME,
  companyLogoQuerySchema,
  createCompanySchema,
  deactivateCompanySchema,
  listCompaniesQuerySchema,
  updateCompanySchema,
  updatePlatformCompanySchema,
} from "./company-schemas";

const LOGO_VERSIONED_CACHE = "public, max-age=31536000, immutable";
const LOGO_UNVERSIONED_CACHE = "no-cache";

@injectable()
export class CompanyController {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly listCompaniesUseCase: ListCompaniesUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase,
    private readonly getCompanyLogoUseCase: GetCompanyLogoUseCase,
    private readonly updateCompanyLogoUseCase: UpdateCompanyLogoUseCase,
    private readonly removeCompanyLogoUseCase: RemoveCompanyLogoUseCase,
    private readonly deactivateCompanyUseCase: DeactivateCompanyUseCase,
  ) {}

  getLogo: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const { v } = companyLogoQuerySchema.parse(request.query);
    const { content, contentType, version } = await this.getCompanyLogoUseCase.execute(id);

    response.type(contentType);
    response.setHeader("Content-Disposition", "inline");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader(
      "Cache-Control",
      v === version ? LOGO_VERSIONED_CACHE : LOGO_UNVERSIONED_CACHE,
    );
    response.status(200);

    await pipeline(content, response);
  };

  updateCurrentLogo: RequestHandler = async (request, response) => {
    if (!request.file) {
      throw new ValidationError(
        `Envie a imagem no campo "${COMPANY_LOGO_FIELD_NAME}" de um formulário multipart/form-data.`,
      );
    }

    const company = await this.updateCompanyLogoUseCase.execute(
      { content: request.file.buffer },
      getTenantContext(request),
    );

    response.status(200).json(company);
  };

  removeCurrentLogo: RequestHandler = async (request, response) => {
    await this.removeCompanyLogoUseCase.execute(getTenantContext(request));

    response.status(204).send();
  };

  create: RequestHandler = async (request, response) => {
    const company = await this.createCompanyUseCase.execute(
      { ...createCompanySchema.parse(request.body), logo: request.file?.buffer },
      getAuthContext(request),
    );

    response.status(201).json(company);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listCompaniesUseCase.execute(
      listCompaniesQuerySchema.parse(request.query),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const company = await this.getCompanyUseCase.execute(id);

    response.status(200).json(company);
  };

  getCurrent: RequestHandler = async (request, response) => {
    const company = await this.getCompanyUseCase.execute(
      getTenantContext(request).companyId,
    );

    response.status(200).json(company);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const company = await this.updateCompanyUseCase.execute(
      id,
      updatePlatformCompanySchema.parse(request.body),
      getAuthContext(request),
    );

    response.status(200).json(company);
  };

  updateCurrent: RequestHandler = async (request, response) => {
    const context = getTenantContext(request);
    const company = await this.updateCompanyUseCase.execute(
      context.companyId,
      updateCompanySchema.parse(request.body),
      context,
    );

    response.status(200).json(company);
  };

  deactivateCurrent: RequestHandler = async (request, response) => {
    await this.deactivateCompanyUseCase.execute(
      deactivateCompanySchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(204).send();
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteCompanyUseCase.execute(id, getAuthContext(request));

    response.status(204).send();
  };
}
