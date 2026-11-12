export interface UpdateRoleDto {
  name?: string;
  description?: string | null;
  permissionIds?: string[];
}
