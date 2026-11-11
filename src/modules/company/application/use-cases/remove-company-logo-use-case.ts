import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  STORAGE_PROVIDER,
  StorageProvider,
} from "../../../../shared/application/storage/storage-provider";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { isCompanyLogoKey } from "../../domain/company-logo";
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from "../../domain/repositories/company-repository";

@injectable()
export class RemoveCompanyLogoUseCase {
  constructor(
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async execute(context: TenantContext): Promise<void> {
    const company = await this.companyRepository.findById(context.companyId);

    if (!company) {
      throw new ResourceNotFoundError("Empresa não encontrada.");
    }

    const previousLogo = company.logo;

    if (!previousLogo) {
      return;
    }

    company.update({ logo: null, updatedById: context.userId });
    await this.companyRepository.update(company);

    if (isCompanyLogoKey(company.id, previousLogo)) {
      await this.storageProvider.delete(previousLogo).catch(() => undefined);
    }
  }
}
