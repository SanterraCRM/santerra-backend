import { inject, injectable } from "tsyringe";

import { AuthContext } from "../../../../shared/application/auth/auth-context";
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from "../../../../shared/application/cryptography/password-hasher";
import {
  UnauthorizedError,
  ValidationError,
} from "../../../../shared/errors/app-error";
import { USER_REPOSITORY, UserRepository } from "../../../user";
import {
  PASSWORD_RESET_REPOSITORY,
  PasswordResetRepository,
} from "../../domain/repositories/password-reset-repository";
import { ChangePasswordDto } from "../dtos/change-password-dto";

@injectable()
export class ChangePasswordUseCase {
  constructor(
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
    @inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: ChangePasswordDto, context: AuthContext): Promise<void> {
    const user = await this.userRepository.findById(context.userId);

    if (!user) {
      throw new UnauthorizedError("Usuário inativo ou inexistente.");
    }

    if (
      !(await this.passwordHasher.compare(
        input.currentPassword,
        user.passwordHash,
      ))
    ) {
      throw new ValidationError(
        "A senha atual está incorreta.",
        "INVALID_CURRENT_PASSWORD",
      );
    }

    if (input.newPassword === input.currentPassword) {
      throw new ValidationError("A nova senha precisa ser diferente da atual.");
    }

    user.update({
      passwordHash: await this.passwordHasher.hash(input.newPassword),
      updatedById: user.id,
    });

    await this.passwordResetRepository.changePassword(user);
  }
}
