import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from "../../../../shared/application/cryptography/password-hasher";
import {
  ForbiddenError,
  ResourceNotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../../shared/errors/app-error";
import { USER_REPOSITORY, UserRepository } from "../../../user";
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from "../../domain/repositories/company-repository";
import { DeactivateCompanyDto } from "../dtos/deactivate-company-dto";

@injectable()
export class DeactivateCompanyUseCase {
  constructor(
    @inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: DeactivateCompanyDto, context: TenantContext): Promise<void> {
    const details = await this.companyRepository.findDetailsById(context.companyId);

    if (!details) {
      throw new ResourceNotFoundError("Empresa não encontrada.");
    }

    if (details.owner?.id !== context.userId) {
      throw new ForbiddenError("Só o dono da empresa pode inativá-la.");
    }

    const user = await this.userRepository.findById(context.userId);

    if (!user) {
      throw new UnauthorizedError("Usuário inativo ou inexistente.");
    }

    if (!(await this.passwordHasher.compare(input.password, user.passwordHash))) {
      throw new ValidationError("A senha está incorreta.", "INVALID_CURRENT_PASSWORD");
    }

    details.company.update({ active: false, updatedById: context.userId });
    await this.companyRepository.update(details.company);
  }
}
