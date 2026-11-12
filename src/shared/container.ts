import { PrismaClient } from "@prisma/client";
import { container } from "tsyringe";

import {
  PASSWORD_HASHER,
  PasswordHasher,
} from "./application/cryptography/password-hasher";
import {
  TOKEN_PROVIDER,
  TokenProvider,
} from "./application/cryptography/token-provider";
import { MAIL_PROVIDER, MailProvider } from "./application/mail/mail-provider";
import {
  STORAGE_PROVIDER,
  StorageProvider,
} from "./application/storage/storage-provider";
import { Argon2PasswordHasher } from "./infrastructure/cryptography/argon2-password-hasher";
import { JwtTokenProvider } from "./infrastructure/cryptography/jwt-token-provider";
import { prisma } from "./infrastructure/database/prisma-client";
import { ConsoleMailProvider } from "./infrastructure/mail/console-mail-provider";
import { ResendMailProvider } from "./infrastructure/mail/resend-mail-provider";
import { DiskStorageProvider } from "./infrastructure/storage/disk-storage-provider";

container.registerInstance(PrismaClient, prisma);

container.registerSingleton<PasswordHasher>(
  PASSWORD_HASHER,
  Argon2PasswordHasher,
);

container.registerSingleton<TokenProvider>(TOKEN_PROVIDER, JwtTokenProvider);

container.registerSingleton<MailProvider>(
  MAIL_PROVIDER,
  process.env.RESEND_API_KEY?.trim() ? ResendMailProvider : ConsoleMailProvider,
);

container.registerSingleton<StorageProvider>(STORAGE_PROVIDER, DiskStorageProvider);
