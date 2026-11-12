import { EmailVerification } from "../entities/email-verification";

export const EMAIL_VERIFICATION_REPOSITORY = "EmailVerificationRepository";

export interface EmailVerificationRepository {
  create(emailVerification: EmailVerification): Promise<EmailVerification>;
  findLatestByEmail(email: string): Promise<EmailVerification | null>;
  findByTokenHash(tokenHash: string): Promise<EmailVerification | null>;
  consumeAttempt(id: string): Promise<boolean>;
  update(emailVerification: EmailVerification): Promise<void>;
}
