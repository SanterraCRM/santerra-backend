import { Role } from "../entities/role";

export const ROLE_REPOSITORY = "RoleRepository";

export interface FindRolesParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  includeDeleted: boolean;
}

export interface RoleListItem {
  role: Role;
  membersCount: number;
}

export interface FindRolesResult {
  roles: RoleListItem[];
  total: number;
}

export interface RoleRepository {
  create(role: Role): Promise<Role>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Role | null>;
  findByName(name: string, companyId: string): Promise<Role | null>;
  findManyByIds(ids: string[], companyId: string): Promise<Role[]>;
  findMany(params: FindRolesParams): Promise<FindRolesResult>;
  countMembers(id: string, companyId: string): Promise<number>;
  update(role: Role): Promise<Role>;
  delete(role: Role): Promise<void>;
}
