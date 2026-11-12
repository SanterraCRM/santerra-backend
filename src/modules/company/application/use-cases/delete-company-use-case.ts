import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from "../../domain/repositories/company-repository";

@injectable()
export class DeleteCompanyUseCase {
  constructor(
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(id: string, context: AuthContext): Promise<void> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new ResourceNotFoundError("Empresa não encontrada.");
    }

    company.delete(context.userId);
    await this.companyRepository.delete(company);
  }
}
