import { Group } from "../entities/group";

export const GROUP_REPOSITORY = "GroupRepository";

export interface FindGroupsParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  createdFrom?: Date;
  createdTo?: Date;
  includeDeleted: boolean;
}

export interface GroupDetails {
  group: Group;
  productsCount: number;
}

export interface FindGroupsResult {
  groups: GroupDetails[];
  total: number;
}

export interface GroupRepository {
  create(group: Group): Promise<GroupDetails>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Group | null>;
  findDetailsById(id: string, companyId: string): Promise<GroupDetails | null>;
  findByName(name: string, companyId: string): Promise<Group | null>;
  findManyByIds(ids: string[], companyId: string): Promise<Group[]>;
  findMany(params: FindGroupsParams): Promise<FindGroupsResult>;
  update(group: Group): Promise<GroupDetails>;
  delete(group: Group): Promise<void>;
}
