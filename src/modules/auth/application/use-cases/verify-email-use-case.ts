import { inject, injectable } from "tsyringe";

import { ValidationError } from "../../../../shared/errors/app-error";
import { User } from "../../../user";
import { EmailVerification } from "../../domain/entities/email-verification";
import {
  EMAIL_VERIFICATION_REPOSITORY,
  EmailVerificationRepository,
} from "../../domain/repositories/email-verification-repository";
import { VerifyEmailDto } from "../dtos/verify-email-dto";
import { VerifyEmailResultDto } from "../dtos/verify-email-result-dto";

const SIGN_UP_WINDOW_IN_MINUTES = 60;
const MILLISECONDS_PER_MINUTE = 60 * 1000;
const INVALID_CODE_MESSAGE = "Código incorreto. Confira o e-mail e tente novamente.";
const EXPIRED_CODE_MESSAGE = "Este código não é mais válido. Peça um novo código.";
const TOO_MANY_ATTEMPTS_MESSAGE =
  "Você errou o código muitas vezes. Peça um novo código.";

@injectable()
export class VerifyEmailUseCase {
  constructor(
    @inject(EMAIL_VERIFICATION_REPOSITORY)
    private readonly emailVerificationRepository: EmailVerificationRepository,
  ) {}

  async execute(input: VerifyEmailDto): Promise<VerifyEmailResultDto> {
    const emailVerification =
      await this.emailVerificationRepository.findLatestByEmail(
        User.normalizeEmail(input.email),
      );

    if (
      !emailVerification ||
      !emailVerification.canBeVerified() ||
      !(await this.emailVerificationRepository.consumeAttempt(emailVerification.id))
    ) {
      throw new ValidationError(EXPIRED_CODE_MESSAGE);
    }

    if (!emailVerification.matchesCode(input.code)) {
      const hasAttemptsLeft =
        emailVerification.attempts + 1 < EmailVerification.MAX_ATTEMPTS;

      throw new ValidationError(
        hasAttemptsLeft ? INVALID_CODE_MESSAGE : TOO_MANY_ATTEMPTS_MESSAGE,
      );
    }

    const { token, tokenHash } = EmailVerification.createToken();

    emailVerification.verify({
      tokenHash,
      expiresAt: new Date(
        Date.now() + SIGN_UP_WINDOW_IN_MINUTES * MILLISECONDS_PER_MINUTE,
      ),
    });

    await this.emailVerificationRepository.update(emailVerification);

    return { verificationToken: token };
  }
}
