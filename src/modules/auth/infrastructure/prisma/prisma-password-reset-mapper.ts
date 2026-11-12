import { PasswordReset as PrismaPasswordReset } from "@prisma/client";

import { PasswordReset } from "../../domain/entities/password-reset";

export class PrismaPasswordResetMapper {
  static toDomain(raw: PrismaPasswordReset): PasswordReset {
    return PasswordReset.reconstitute({
      id: raw.id,
      userId: raw.userId,
      tokenHash: raw.tokenHash,
      expiresAt: raw.expiresAt,
      usedAt: raw.usedAt,
      createdAt: raw.createdAt,
    });
  }
}
