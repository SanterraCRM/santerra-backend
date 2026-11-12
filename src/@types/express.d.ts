import {
  AuthContext,
  TenantContext,
} from "../shared/application/auth/auth-context";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      tenant?: TenantContext;
    }
  }
}
