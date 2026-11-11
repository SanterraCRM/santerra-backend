import { inject, injectable } from "tsyringe";

import {
  STORAGE_PROVIDER,
  StorageProvider,
} from "../../../../shared/application/storage/storage-provider";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { getCompanyLogoContentType } from "../../domain/company-logo";
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from "../../domain/repositories/company-repository";
import { CompanyLogoDto } from "../dtos/company-logo-dto";

const LOGO_NOT_FOUND_MESSAGE = "Esta empresa não tem logo.";

@injectable()
export class GetCompanyLogoUseCase {
  constructor(
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async execute(companyId: string): Promise<CompanyLogoDto> {
    const company = await this.companyRepository.findById(companyId);
    const logo = company?.logo ?? null;
    const contentType = logo ? getCompanyLogoContentType(companyId, logo) : null;

    if (!logo || !contentType) {
      throw new ResourceNotFoundError(LOGO_NOT_FOUND_MESSAGE);
    }

    const content = await this.storageProvider.read(logo);

    if (!content) {
      throw new ResourceNotFoundError(LOGO_NOT_FOUND_MESSAGE);
    }

    return { content, contentType, version: logo };
  }
}
