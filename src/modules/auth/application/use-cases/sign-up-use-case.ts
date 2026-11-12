import { inject, injectable } from "tsyringe";

import {
  PASSWORD_HASHER,
  PasswordHasher,
} from "../../../../shared/application/cryptography/password-hasher";
import {
  TOKEN_PROVIDER,
  TokenProvider,
} from "../../../../shared/application/cryptography/token-provider";
import { ConflictError, ValidationError } from "../../../../shared/errors/app-error";
import { User, USER_REPOSITORY, UserRepository } from "../../../user";
import { EmailVerification } from "../../domain/entities/email-verification";
import {
  EMAIL_VERIFICATION_REPOSITORY,
  EmailVerificationRepository,
} from "../../domain/repositories/email-verification-repository";
import { SignUpDto } from "../dtos/sign-up-dto";
import { SignUpResultDto } from "../dtos/sign-up-result-dto";
import { CompanyOwnerCreator } from "../services/company-owner-creator";

const EMAIL_NOT_VERIFIED_CODE = "EMAIL_NOT_VERIFIED";
const EMAIL_NOT_VERIFIED_MESSAGE =
  "A confirmação do e-mail expirou. Confirme o e-mail novamente.";

@injectable()
export class SignUpUseCase {
  constructor(
    @inject(EMAIL_VERIFICATION_REPOSITORY)
    private readonly emailVerificationRepository: EmailVerificationRepository,
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @inject(TOKEN_PROVIDER)
    private readonly tokenProvider: TokenProvider,
    private readonly companyOwnerCreator: CompanyOwnerCreator,
  ) {}

  async execute(input: SignUpDto): Promise<SignUpResultDto> {
    const email = User.normalizeEmail(input.email);

    if (await this.userRepository.findByEmail(email)) {
      throw new ConflictError("Já existe um usuário com este e-mail.");
    }

    const emailVerification =
      await this.emailVerificationRepository.findByTokenHash(
        EmailVerification.hash(input.verificationToken),
      );

    if (!emailVerification || !emailVerification.isVerifiedFor(email)) {
      throw new ValidationError(EMAIL_NOT_VERIFIED_MESSAGE, EMAIL_NOT_VERIFIED_CODE);
    }

    const user = User.create({
      name: input.name,
      email,
      passwordHash: await this.passwordHasher.hash(input.password),
    });

    emailVerification.use();

    const company = await this.companyOwnerCreator.create({
      owner: user,
      companyName: input.companyName,
      newUser: user,
      emailVerification,
    });

    return {
      token: this.tokenProvider.sign({ userId: user.id, companyId: company.id }),
      user: user.toPublicObject(),
      company: company.toObject(),
    };
  }
}
