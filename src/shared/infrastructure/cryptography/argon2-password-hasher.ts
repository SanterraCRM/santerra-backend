import argon2 from "argon2";
import { injectable } from "tsyringe";

import { PasswordHasher } from "../../application/cryptography/password-hasher";

@injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
