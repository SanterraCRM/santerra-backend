export interface CreateRoleDto {
  name: string;
  description?: string | null;
  permissionIds?: string[];
}
