import { EmailVerification as PrismaEmailVerification } from "@prisma/client";

import { EmailVerification } from "../../domain/entities/email-verification";

export class PrismaEmailVerificationMapper {
  static toDomain(raw: PrismaEmailVerification): EmailVerification {
    return EmailVerification.reconstitute({
      id: raw.id,
      email: raw.email,
      codeHash: raw.codeHash,
      tokenHash: raw.tokenHash,
      attempts: raw.attempts,
      expiresAt: raw.expiresAt,
      verifiedAt: raw.verifiedAt,
      usedAt: raw.usedAt,
      createdAt: raw.createdAt,
    });
  }
}
