import { container } from "tsyringe";

import {
  AUTHENTICATOR,
  Authenticator,
} from "../../shared/application/auth/authenticator";
import {
  PLATFORM_COMPANY_CREATOR,
  PlatformCompanyCreator,
} from "../../shared/application/companies/platform-company-creator";
import { PlatformCompanyCreatorService } from "./application/services/platform-company-creator-service";
import { AuthenticateUseCase } from "./application/use-cases/authenticate-use-case";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "./domain/repositories/auth-repository";
import {
  EMAIL_VERIFICATION_REPOSITORY,
  EmailVerificationRepository,
} from "./domain/repositories/email-verification-repository";
import {
  PASSWORD_RESET_REPOSITORY,
  PasswordResetRepository,
} from "./domain/repositories/password-reset-repository";
import { PrismaAuthRepository } from "./infrastructure/prisma/prisma-auth-repository";
import { PrismaEmailVerificationRepository } from "./infrastructure/prisma/prisma-email-verification-repository";
import { PrismaPasswordResetRepository } from "./infrastructure/prisma/prisma-password-reset-repository";

container.registerSingleton<AuthRepository>(AUTH_REPOSITORY, PrismaAuthRepository);

container.register<PlatformCompanyCreator>(PLATFORM_COMPANY_CREATOR, {
  useClass: PlatformCompanyCreatorService,
});

container.registerSingleton<EmailVerificationRepository>(
  EMAIL_VERIFICATION_REPOSITORY,
  PrismaEmailVerificationRepository,
);

container.registerSingleton<PasswordResetRepository>(
  PASSWORD_RESET_REPOSITORY,
  PrismaPasswordResetRepository,
);

container.registerSingleton<Authenticator>(AUTHENTICATOR, AuthenticateUseCase);
