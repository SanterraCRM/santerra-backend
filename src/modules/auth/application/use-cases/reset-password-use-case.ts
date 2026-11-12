import { inject, injectable } from "tsyringe";

import {
  PASSWORD_HASHER,
  PasswordHasher,
} from "../../../../shared/application/cryptography/password-hasher";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { USER_REPOSITORY, UserRepository } from "../../../user";
import { PasswordReset } from "../../domain/entities/password-reset";
import {
  PASSWORD_RESET_REPOSITORY,
  PasswordResetRepository,
} from "../../domain/repositories/password-reset-repository";
import { ResetPasswordDto } from "../dtos/reset-password-dto";

const INVALID_LINK_MESSAGE = "Link de recuperação inválido ou expirado.";

@injectable()
export class ResetPasswordUseCase {
  constructor(
    @inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: ResetPasswordDto): Promise<void> {
    const passwordReset = await this.passwordResetRepository.findByTokenHash(
      PasswordReset.hashToken(input.token),
    );

    if (!passwordReset || !passwordReset.isPending()) {
      throw new ResourceNotFoundError(INVALID_LINK_MESSAGE);
    }

    const user = await this.userRepository.findById(passwordReset.userId);

    if (!user || !user.active) {
      throw new ResourceNotFoundError(INVALID_LINK_MESSAGE);
    }

    user.update({
      passwordHash: await this.passwordHasher.hash(input.password),
      updatedById: user.id,
    });
    passwordReset.use();

    await this.passwordResetRepository.resetPassword({ passwordReset, user });
  }
}
