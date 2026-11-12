import { AuthContext, TenantContext } from "./auth-context";

export const AUTHENTICATOR = "Authenticator";

export interface AuthenticationResult {
  auth: AuthContext;
  tenant: TenantContext | null;
}

export interface Authenticator {
  execute(token: string): Promise<AuthenticationResult>;
}
