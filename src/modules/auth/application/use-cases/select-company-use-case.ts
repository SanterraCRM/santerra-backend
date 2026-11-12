import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import { ALL_PERMISSIONS } from "../../../../shared/application/auth/permissions";
import {
  TOKEN_PROVIDER,
  TokenProvider,
} from "../../../../shared/application/cryptography/token-provider";
import { ForbiddenError } from "../../../../shared/errors/app-error";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "../../domain/repositories/auth-repository";
import { SelectCompanyDto } from "../dtos/select-company-dto";
import { SelectCompanyResultDto } from "../dtos/select-company-result-dto";

@injectable()
export class SelectCompanyUseCase {
  constructor(
    @inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @inject(TOKEN_PROVIDER)
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute(
    input: SelectCompanyDto,
    context: AuthContext,
  ): Promise<SelectCompanyResultDto> {
    const access = await this.authRepository.findAccess(
      context.userId,
      input.companyId,
    );

    if (!access) {
      throw new ForbiddenError("Você não tem acesso a esta empresa.");
    }

    return {
      token: this.tokenProvider.sign({
        userId: context.userId,
        companyId: access.company.id,
      }),
      company: access.company,
      permissions: access.isOwner ? ALL_PERMISSIONS : access.rolePermissions,
    };
  }
}
