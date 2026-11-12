import { inject, injectable } from "tsyringe";

import {
  MAIL_PROVIDER,
  MailProvider,
} from "../../../../shared/application/mail/mail-provider";
import { User, USER_REPOSITORY, UserRepository } from "../../../user";
import { PasswordReset } from "../../domain/entities/password-reset";
import {
  PASSWORD_RESET_REPOSITORY,
  PasswordResetRepository,
} from "../../domain/repositories/password-reset-repository";
import { ForgotPasswordDto } from "../dtos/forgot-password-dto";

const PASSWORD_RESET_TTL_IN_MINUTES = 60;
const MILLISECONDS_PER_MINUTE = 60 * 1000;
const DEFAULT_RESET_URL = "http://localhost:3000/auth/reset-password";

@injectable()
export class ForgotPasswordUseCase {
  constructor(
    @inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(MAIL_PROVIDER)
    private readonly mailProvider: MailProvider,
  ) {}

  async execute(input: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(
      User.normalizeEmail(input.email),
    );

    if (!user || !user.active) {
      return;
    }

    const { token, tokenHash } = PasswordReset.createToken();

    await this.passwordResetRepository.create(
      PasswordReset.create({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(
          Date.now() + PASSWORD_RESET_TTL_IN_MINUTES * MILLISECONDS_PER_MINUTE,
        ),
      }),
    );

    await this.sendPasswordResetEmail(user, token);
  }

  private async sendPasswordResetEmail(user: User, token: string): Promise<void> {
    const resetUrl = process.env.PASSWORD_RESET_URL ?? DEFAULT_RESET_URL;

    await this.mailProvider.send({
      to: user.email,
      subject: "Recuperação de senha",
      text: [
        `Olá, ${user.name}.`,
        "Recebemos um pedido para redefinir a sua senha no Santerra.",
        `Para criar uma nova senha, acesse: ${resetUrl}?token=${token}`,
        `O link expira em ${PASSWORD_RESET_TTL_IN_MINUTES} minutos.`,
        "Se você não fez esse pedido, ignore este e-mail: a sua senha continua a mesma.",
      ].join("\n"),
    });
  }
}
