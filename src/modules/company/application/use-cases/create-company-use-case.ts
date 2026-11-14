import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import {
  PLATFORM_COMPANY_CREATOR,
  PlatformCompanyCreator,
} from "../../../../shared/application/companies/platform-company-creator";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from "../../domain/repositories/company-repository";
import { CompanyDetailsDto, toCompanyDetailsDto } from "../dtos/company-details-dto";
import { CreateCompanyDto } from "../dtos/create-company-dto";

@injectable()
export class CreateCompanyUseCase {
  constructor(
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @inject(PLATFORM_COMPANY_CREATOR)
    private readonly platformCompanyCreator: PlatformCompanyCreator,
  ) {}

  async execute(input: CreateCompanyDto, context: AuthContext): Promise<CompanyDetailsDto> {
    const companyId = await this.platformCompanyCreator.create({
      ownerEmail: input.ownerEmail,
      companyName: input.name,
      companyDescription: input.description,
      companyLogo: input.logo,
      createdById: context.userId,
    });
    const company = await this.companyRepository.findDetailsById(companyId);

    if (!company) {
      throw new ResourceNotFoundError("Empresa não encontrada.");
    }

    return toCompanyDetailsDto(company);
  }
}
