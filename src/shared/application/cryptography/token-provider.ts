export const TOKEN_PROVIDER = "TokenProvider";

export interface AccessTokenPayload {
  userId: string;
  companyId: string | null;
}

export interface TokenProvider {
  sign(payload: AccessTokenPayload): string;
  verify(token: string): AccessTokenPayload | null;
}
