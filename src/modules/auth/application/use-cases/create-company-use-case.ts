import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import { UnauthorizedError } from "../../../../shared/errors/app-error";
import { CompanyProps } from "../../../company";
import { USER_REPOSITORY, UserRepository } from "../../../user";
import { CreateCompanyDto } from "../dtos/create-company-dto";
import { CompanyOwnerCreator } from "../services/company-owner-creator";

@injectable()
export class CreateCompanyUseCase {
  constructor(
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly companyOwnerCreator: CompanyOwnerCreator,
  ) {}

  async execute(input: CreateCompanyDto, context: AuthContext): Promise<CompanyProps> {
    const user = await this.userRepository.findById(context.userId);

    if (!user) {
      throw new UnauthorizedError("Usuário inativo ou inexistente.");
    }

    const company = await this.companyOwnerCreator.create({
      owner: user,
      companyName: input.name,
      companyDescription: input.description,
      companyLogo: input.logo,
    });

    return company.toObject();
  }
}
