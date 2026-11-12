import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import {
  AuthenticationResult,
  Authenticator,
} from "../../../../shared/application/auth/authenticator";
import { ALL_PERMISSIONS } from "../../../../shared/application/auth/permissions";
import {
  TOKEN_PROVIDER,
  TokenProvider,
} from "../../../../shared/application/cryptography/token-provider";
import { UnauthorizedError } from "../../../../shared/errors/app-error";
import { USER_REPOSITORY, UserRepository } from "../../../user";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "../../domain/repositories/auth-repository";

@injectable()
export class AuthenticateUseCase implements Authenticator {
  constructor(
    @inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(TOKEN_PROVIDER)
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute(token: string): Promise<AuthenticationResult> {
    const payload = this.tokenProvider.verify(token);

    if (!payload) {
      throw new UnauthorizedError("Token de acesso inválido ou expirado.");
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user || !user.active) {
      throw new UnauthorizedError("Usuário inativo ou inexistente.");
    }

    const auth: AuthContext = {
      userId: user.id,
      isPlatformAdmin: user.isPlatformAdmin,
    };

    if (!payload.companyId) {
      return { auth, tenant: null };
    }

    const access = await this.authRepository.findAccess(
      user.id,
      payload.companyId,
    );

    if (!access) {
      throw new UnauthorizedError(
        "Seu acesso a esta empresa foi removido. Entre novamente.",
      );
    }

    return {
      auth,
      tenant: {
        ...auth,
        companyId: access.company.id,
        userCompanyId: access.userCompanyId,
        permissions: access.isOwner ? ALL_PERMISSIONS : access.rolePermissions,
      },
    };
  }
}
