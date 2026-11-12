import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { EmailVerification } from "../../domain/entities/email-verification";
import { EmailVerificationRepository } from "../../domain/repositories/email-verification-repository";
import { PrismaEmailVerificationMapper } from "./prisma-email-verification-mapper";

@injectable()
export class PrismaEmailVerificationRepository implements EmailVerificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(emailVerification: EmailVerification): Promise<EmailVerification> {
    const createdEmailVerification = await this.prisma.emailVerification.create({
      data: emailVerification.toObject(),
    });

    return PrismaEmailVerificationMapper.toDomain(createdEmailVerification);
  }

  async findLatestByEmail(email: string): Promise<EmailVerification | null> {
    const emailVerification = await this.prisma.emailVerification.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    return emailVerification
      ? PrismaEmailVerificationMapper.toDomain(emailVerification)
      : null;
  }

  async findByTokenHash(tokenHash: string): Promise<EmailVerification | null> {
    const emailVerification = await this.prisma.emailVerification.findUnique({
      where: { tokenHash },
    });

    return emailVerification
      ? PrismaEmailVerificationMapper.toDomain(emailVerification)
      : null;
  }

  async consumeAttempt(id: string): Promise<boolean> {
    const { count } = await this.prisma.emailVerification.updateMany({
      where: {
        id,
        verifiedAt: null,
        attempts: { lt: EmailVerification.MAX_ATTEMPTS },
      },
      data: {
        attempts: { increment: 1 },
      },
    });

    return count > 0;
  }

  async update(emailVerification: EmailVerification): Promise<void> {
    const { id, tokenHash, expiresAt, verifiedAt, usedAt } =
      emailVerification.toObject();

    await this.prisma.emailVerification.update({
      where: { id },
      data: { tokenHash, expiresAt, verifiedAt, usedAt },
    });
  }
}
