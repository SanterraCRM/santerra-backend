export interface AuthContext {
  userId: string;
  isPlatformAdmin: boolean;
}

export interface TenantContext extends AuthContext {
  companyId: string;
  userCompanyId: string;
  permissions: string[];
}
