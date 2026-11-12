import { randomUUID } from "node:crypto";

export interface MemberProps {
  id: string;
  userId: string;
  companyId: string;
  name: string;
  email: string;
  isOwner: boolean;
  active: boolean;
  roleIds: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

interface CreateMemberProps {
  userId: string;
  companyId: string;
  name: string;
  email: string;
  isOwner?: boolean;
  roleIds?: string[];
  createdById?: string | null;
}

export interface UpdateMemberProps {
  active?: boolean;
  roleIds?: string[];
  updatedById?: string | null;
}

export class Member {
  private constructor(private readonly props: MemberProps) {}

  static create(
    input: CreateMemberProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Member {
    return new Member({
      id,
      userId: input.userId,
      companyId: input.companyId,
      name: input.name,
      email: input.email,
      isOwner: input.isOwner ?? false,
      active: true,
      roleIds: Member.normalizeRoleIds(input.roleIds ?? []),
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: MemberProps): Member {
    return new Member({ ...props, roleIds: [...props.roleIds] });
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get isOwner(): boolean {
    return this.props.isOwner;
  }

  get roleIds(): string[] {
    return [...this.props.roleIds];
  }

  get isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  update(input: UpdateMemberProps, updatedAt = new Date()): void {
    if (input.active !== undefined) {
      this.props.active = input.active;
    }

    if (input.roleIds !== undefined) {
      this.props.roleIds = Member.normalizeRoleIds(input.roleIds);
    }

    this.props.updatedById = input.updatedById ?? null;
    this.props.updatedAt = updatedAt;
  }

  restore(
    roleIds: string[],
    restoredById: string | null = null,
    restoredAt = new Date(),
  ): void {
    this.props.active = true;
    this.props.roleIds = Member.normalizeRoleIds(roleIds);
    this.props.deletedAt = null;
    this.props.deletedById = null;
    this.props.updatedById = restoredById;
    this.props.updatedAt = restoredAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): MemberProps {
    return { ...this.props, roleIds: [...this.props.roleIds] };
  }

  private static normalizeRoleIds(roleIds: string[]): string[] {
    return [...new Set(roleIds)];
  }
}
