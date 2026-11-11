import { User } from "../../../user";
import { PasswordReset } from "../entities/password-reset";

export const PASSWORD_RESET_REPOSITORY = "PasswordResetRepository";

export interface ResetPasswordParams {
  passwordReset: PasswordReset;
  user: User;
}

export interface PasswordResetRepository {
  create(passwordReset: PasswordReset): Promise<PasswordReset>;
  findByTokenHash(tokenHash: string): Promise<PasswordReset | null>;
  resetPassword(params: ResetPasswordParams): Promise<void>;
  changePassword(user: User): Promise<void>;
}
