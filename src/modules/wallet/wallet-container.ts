import { container } from "tsyringe";

import {
  WALLET_REPOSITORY,
  WalletRepository,
} from "./domain/repositories/wallet-repository";
import { PrismaWalletRepository } from "./infrastructure/prisma/prisma-wallet-repository";

container.registerSingleton<WalletRepository>(
  WALLET_REPOSITORY,
  PrismaWalletRepository,
);
