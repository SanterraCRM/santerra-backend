export interface CreateMemberDto {
  email: string;
  name?: string;
  password?: string;
  roleIds?: string[];
}
