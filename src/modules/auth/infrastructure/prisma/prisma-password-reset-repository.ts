import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

import { User } from "../../../user";
import { PasswordReset } from "../../domain/entities/password-reset";
import {
  PasswordResetRepository,
  ResetPasswordParams,
} from "../../domain/repositories/password-reset-repository";
import { PrismaPasswordResetMapper } from "./prisma-password-reset-mapper";

@injectable()
export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(passwordReset: PasswordReset): Promise<PasswordReset> {
    const createdPasswordReset = await this.prisma.passwordReset.create({
      data: passwordReset.toObject(),
    });

    return PrismaPasswordResetMapper.toDomain(createdPasswordReset);
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { tokenHash },
    });

    return passwordReset ? PrismaPasswordResetMapper.toDomain(passwordReset) : null;
  }

  async resetPassword({ passwordReset, user }: ResetPasswordParams): Promise<void> {
    const passwordResetData = passwordReset.toObject();
    const userData = user.toObject();

    await this.prisma.$transaction([
      this.prisma.passwordReset.update({
        where: {
          id: passwordResetData.id,
          usedAt: null,
        },
        data: {
          usedAt: passwordResetData.usedAt,
        },
      }),
      this.prisma.passwordReset.updateMany({
        where: {
          userId: userData.id,
          usedAt: null,
        },
        data: {
          usedAt: passwordResetData.usedAt,
        },
      }),
      this.prisma.user.update({
        where: {
          id: userData.id,
          deletedAt: null,
        },
        data: {
          passwordHash: userData.passwordHash,
          updatedAt: userData.updatedAt,
          updatedById: userData.updatedById,
        },
      }),
    ]);
  }

  async changePassword(user: User): Promise<void> {
    const userData = user.toObject();

    await this.prisma.$transaction([
      this.prisma.passwordReset.updateMany({
        where: {
          userId: userData.id,
          usedAt: null,
        },
        data: {
          usedAt: userData.updatedAt,
        },
      }),
      this.prisma.user.update({
        where: {
          id: userData.id,
          deletedAt: null,
        },
        data: {
          passwordHash: userData.passwordHash,
          updatedAt: userData.updatedAt,
          updatedById: userData.updatedById,
        },
      }),
    ]);
  }
}
