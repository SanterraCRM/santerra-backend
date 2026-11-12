import { inject, injectable } from "tsyringe";

import {
  PASSWORD_HASHER,
  PasswordHasher,
} from "../../../../shared/application/cryptography/password-hasher";
import {
  TOKEN_PROVIDER,
  TokenProvider,
} from "../../../../shared/application/cryptography/token-provider";
import {
  ForbiddenError,
  UnauthorizedError,
} from "../../../../shared/errors/app-error";
import { User, USER_REPOSITORY, UserRepository } from "../../../user";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "../../domain/repositories/auth-repository";
import { LoginDto } from "../dtos/login-dto";
import { LoginResultDto } from "../dtos/login-result-dto";

@injectable()
export class LoginUseCase {
  constructor(
    @inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @inject(TOKEN_PROVIDER)
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute(input: LoginDto): Promise<LoginResultDto> {
    const user = await this.userRepository.findByEmail(
      User.normalizeEmail(input.email),
    );

    if (
      !user ||
      !(await this.passwordHasher.compare(input.password, user.passwordHash))
    ) {
      throw new UnauthorizedError("E-mail ou senha inválidos.");
    }

    if (!user.active) {
      throw new ForbiddenError("Usuário inativo.");
    }

    user.registerLogin();
    await this.userRepository.updateLastLogin(user);

    return {
      token: this.tokenProvider.sign({ userId: user.id, companyId: null }),
      user: user.toPublicObject(),
      companies: await this.authRepository.findCompanies(user.id),
    };
  }
}
