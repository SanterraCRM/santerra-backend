import jwt, { SignOptions } from "jsonwebtoken";
import { injectable } from "tsyringe";

import {
  AccessTokenPayload,
  TokenProvider,
} from "../../application/cryptography/token-provider";

const DEFAULT_EXPIRES_IN = "1d";
const MIN_SECRET_LENGTH = 32;

@injectable()
export class JwtTokenProvider implements TokenProvider {
  private readonly secret: string;
  private readonly expiresIn: SignOptions["expiresIn"];

  constructor() {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `A variável de ambiente JWT_SECRET precisa ter pelo menos ${MIN_SECRET_LENGTH} caracteres.`,
      );
    }

    this.secret = secret;
    this.expiresIn = (process.env.JWT_EXPIRES_IN ??
      DEFAULT_EXPIRES_IN) as SignOptions["expiresIn"];
  }

  sign(payload: AccessTokenPayload): string {
    return jwt.sign({ companyId: payload.companyId }, this.secret, {
      algorithm: "HS256",
      subject: payload.userId,
      expiresIn: this.expiresIn,
    });
  }

  verify(token: string): AccessTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret, { algorithms: ["HS256"] });

      if (typeof decoded === "string" || typeof decoded.sub !== "string") {
        return null;
      }

      return {
        userId: decoded.sub,
        companyId:
          typeof decoded.companyId === "string" ? decoded.companyId : null,
      };
    } catch {
      return null;
    }
  }
}
