import { Member } from "../entities/member";

export const MEMBER_REPOSITORY = "MemberRepository";

export interface FindMembersParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  active?: boolean;
  roleId?: string;
  hasWallet?: boolean;
  includeDeleted: boolean;
}

export interface MemberEmployee {
  id: string;
  person: { id: string; name: string };
}

export interface MemberDetails {
  member: Member;
  employee: MemberEmployee | null;
}

export interface MemberWalletUsage {
  balance: number;
  actionsCount: number;
}

export interface FindMembersResult {
  members: MemberDetails[];
  total: number;
}

export interface MemberRepository {
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Member | null>;
  findDetailsById(id: string, companyId: string): Promise<MemberDetails | null>;
  findByUserId(
    userId: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<Member | null>;
  findMany(params: FindMembersParams): Promise<FindMembersResult>;
  findWalletUsage(id: string, companyId: string): Promise<MemberWalletUsage | null>;
  update(member: Member): Promise<MemberDetails>;
  delete(member: Member): Promise<void>;
}
