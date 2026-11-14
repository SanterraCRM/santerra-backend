import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  STORAGE_PROVIDER,
  StorageProvider,
} from "../../../../shared/application/storage/storage-provider";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { isCompanyLogoKey, prepareCompanyLogo } from "../../domain/company-logo";
import { Company, CompanyProps } from "../../domain/entities/company";
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from "../../domain/repositories/company-repository";
import { UpdateCompanyLogoDto } from "../dtos/update-company-logo-dto";

@injectable()
export class UpdateCompanyLogoUseCase {
  constructor(
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async execute(
    input: UpdateCompanyLogoDto,
    context: TenantContext,
  ): Promise<CompanyProps> {
    const company = await this.companyRepository.findById(context.companyId);

    if (!company) {
      throw new ResourceNotFoundError("Empresa não encontrada.");
    }

    const { key: logo, content } = prepareCompanyLogo(company.id, input.content);
    const previousLogo = company.logo;
    let updatedCompany: Company;

    await this.storageProvider.save(logo, content);

    try {
      company.update({ logo, updatedById: context.userId });
      updatedCompany = await this.companyRepository.update(company);
    } catch (error) {
      await this.storageProvider.delete(logo).catch(() => undefined);
      throw error;
    }

    if (previousLogo && isCompanyLogoKey(company.id, previousLogo)) {
      await this.storageProvider.delete(previousLogo).catch(() => undefined);
    }

    return updatedCompany.toObject();
  }
}
