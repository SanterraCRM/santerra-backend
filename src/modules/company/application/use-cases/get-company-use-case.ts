import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from "../../domain/repositories/company-repository";
import { CompanyDetailsDto, toCompanyDetailsDto } from "../dtos/company-details-dto";

@injectable()
export class GetCompanyUseCase {
  constructor(
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(id: string): Promise<CompanyDetailsDto> {
    const company = await this.companyRepository.findDetailsById(id);

    if (!company) {
      throw new ResourceNotFoundError("Empresa não encontrada.");
    }

    return toCompanyDetailsDto(company);
  }
}
