import { inject, injectable } from "tsyringe";

import {
  MAIL_PROVIDER,
  MailProvider,
} from "../../../../shared/application/mail/mail-provider";
import {
  ConflictError,
  TooManyRequestsError,
} from "../../../../shared/errors/app-error";
import { User, USER_REPOSITORY, UserRepository } from "../../../user";
import { EmailVerification } from "../../domain/entities/email-verification";
import {
  EMAIL_VERIFICATION_REPOSITORY,
  EmailVerificationRepository,
} from "../../domain/repositories/email-verification-repository";
import { SendEmailVerificationDto } from "../dtos/send-email-verification-dto";

const CODE_TTL_IN_MINUTES = 15;
const RESEND_INTERVAL_IN_SECONDS = 60;
const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_MINUTE = 60 * MILLISECONDS_PER_SECOND;

@injectable()
export class SendEmailVerificationUseCase {
  constructor(
    @inject(EMAIL_VERIFICATION_REPOSITORY)
    private readonly emailVerificationRepository: EmailVerificationRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(MAIL_PROVIDER)
    private readonly mailProvider: MailProvider,
  ) {}

  async execute(input: SendEmailVerificationDto): Promise<void> {
    const email = User.normalizeEmail(input.email);

    if (await this.userRepository.findByEmail(email)) {
      throw new ConflictError("Já existe uma conta com este e-mail.");
    }

    const latestVerification =
      await this.emailVerificationRepository.findLatestByEmail(email);

    if (latestVerification) {
      this.ensureResendIntervalHasPassed(latestVerification);
    }

    const { code, codeHash } = EmailVerification.createCode();

    await this.sendVerificationEmail(email, code);

    await this.emailVerificationRepository.create(
      EmailVerification.create({
        email,
        codeHash,
        expiresAt: new Date(
          Date.now() + CODE_TTL_IN_MINUTES * MILLISECONDS_PER_MINUTE,
        ),
      }),
    );
  }

  private ensureResendIntervalHasPassed(
    latestVerification: EmailVerification,
  ): void {
    const elapsedInSeconds =
      (Date.now() - latestVerification.createdAt.getTime()) /
      MILLISECONDS_PER_SECOND;
    const remainingInSeconds = Math.ceil(
      RESEND_INTERVAL_IN_SECONDS - elapsedInSeconds,
    );

    if (remainingInSeconds > 0) {
      throw new TooManyRequestsError(
        `Aguarde ${remainingInSeconds} segundos para pedir um novo código.`,
      );
    }
  }

  private async sendVerificationEmail(email: string, code: string): Promise<void> {
    await this.mailProvider.send({
      to: email,
      subject: `Seu código de verificação: ${code}`,
      text: [
        "Olá!",
        `Use o código ${code} para confirmar o seu e-mail no WebUp! e continuar o cadastro.`,
        `O código expira em ${CODE_TTL_IN_MINUTES} minutos.`,
        "Se você não está criando uma conta, ignore este e-mail.",
      ].join("\n"),
    });
  }
}
