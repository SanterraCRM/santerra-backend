import { Permission } from "../entities/permission";

export const PERMISSION_REPOSITORY = "PermissionRepository";

export interface FindPermissionsParams {
  page: number;
  limit: number;
  search?: string;
  includeDeleted: boolean;
}

export interface FindPermissionsResult {
  permissions: Permission[];
  total: number;
}

export interface PermissionRepository {
  create(permission: Permission): Promise<Permission>;
  findById(id: string, includeDeleted?: boolean): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  findMany(params: FindPermissionsParams): Promise<FindPermissionsResult>;
  update(permission: Permission): Promise<Permission>;
  delete(permission: Permission): Promise<void>;
}
