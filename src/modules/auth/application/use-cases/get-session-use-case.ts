import { inject, injectable } from "tsyringe";

import {
  AuthContext,
  TenantContext,
} from "../../../../shared/application/auth/auth-context";
import { UnauthorizedError } from "../../../../shared/errors/app-error";
import { USER_REPOSITORY, UserRepository } from "../../../user";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "../../domain/repositories/auth-repository";
import { SessionDto } from "../dtos/session-dto";

@injectable()
export class GetSessionUseCase {
  constructor(
    @inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    context: AuthContext,
    tenant: TenantContext | null,
  ): Promise<SessionDto> {
    const user = await this.userRepository.findById(context.userId);

    if (!user) {
      throw new UnauthorizedError("Usuário inativo ou inexistente.");
    }

    return {
      user: user.toPublicObject(),
      companies: await this.authRepository.findCompanies(user.id),
      currentCompanyId: tenant?.companyId ?? null,
      permissions: tenant?.permissions ?? [],
    };
  }
}
