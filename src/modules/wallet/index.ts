import "./wallet-container";

export { Wallet } from "./domain/entities/wallet";
export { InsufficientBalanceError } from "./domain/errors/insufficient-balance-error";
export { WALLET_REPOSITORY } from "./domain/repositories/wallet-repository";
export type { WalletRepository } from "./domain/repositories/wallet-repository";
export { changeWalletBalance } from "./infrastructure/prisma/wallet-balance";
export { walletRouter } from "./presentation/http/wallet-routes";
