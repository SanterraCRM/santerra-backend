import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { CompanyProps } from "../../domain/entities/company";
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from "../../domain/repositories/company-repository";
import { UpdateCompanyDto } from "../dtos/update-company-dto";

@injectable()
export class UpdateCompanyUseCase {
  constructor(
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateCompanyDto,
    context: AuthContext,
  ): Promise<CompanyProps> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new ResourceNotFoundError("Empresa não encontrada.");
    }

    company.update({ ...input, updatedById: context.userId });
    const updatedCompany = await this.companyRepository.update(company);

    return updatedCompany.toObject();
  }
}
