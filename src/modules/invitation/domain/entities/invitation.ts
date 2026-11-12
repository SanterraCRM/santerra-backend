import { createHash, randomBytes, randomUUID } from "node:crypto";

import { DomainError } from "../../../../shared/domain/errors/domain-error";

const TOKEN_BYTES = 32;

export interface InvitationProps {
  id: string;
  email: string;
  roleIds: string[];
  tokenHash: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
}

export type PublicInvitationProps = Omit<InvitationProps, "tokenHash">;

interface CreateInvitationProps {
  email: string;
  roleIds?: string[];
  tokenHash: string;
  expiresAt: Date;
  companyId: string;
  createdById?: string | null;
}

export class Invitation {
  private constructor(private readonly props: InvitationProps) {}

  static create(
    input: CreateInvitationProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): Invitation {
    return new Invitation({
      id,
      email: Invitation.normalizeEmail(input.email),
      roleIds: [...new Set(input.roleIds ?? [])],
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      acceptedAt: null,
      companyId: input.companyId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      createdById: input.createdById ?? null,
      updatedById: null,
      deletedById: null,
    });
  }

  static reconstitute(props: InvitationProps): Invitation {
    return new Invitation({ ...props, roleIds: [...props.roleIds] });
  }

  static createToken(): { token: string; tokenHash: string } {
    const token = randomBytes(TOKEN_BYTES).toString("base64url");

    return { token, tokenHash: Invitation.hashToken(token) };
  }

  static hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  static normalizeEmail(email: string): string {
    if (typeof email !== "string" || email.trim().length === 0) {
      throw new DomainError("O e-mail do convite é obrigatório.");
    }

    return email.trim().toLowerCase();
  }

  get email(): string {
    return this.props.email;
  }

  get companyId(): string {
    return this.props.companyId;
  }

  get roleIds(): string[] {
    return [...this.props.roleIds];
  }

  get createdById(): string | null {
    return this.props.createdById;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isAccepted(): boolean {
    return this.props.acceptedAt !== null;
  }

  get isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  isExpired(now = new Date()): boolean {
    return this.props.expiresAt <= now;
  }

  isPending(now = new Date()): boolean {
    return (
      this.props.acceptedAt === null &&
      this.props.deletedAt === null &&
      this.props.expiresAt > now
    );
  }

  accept(acceptedAt = new Date()): void {
    this.props.acceptedAt = acceptedAt;
    this.props.updatedAt = acceptedAt;
  }

  delete(deletedById: string | null = null, deletedAt = new Date()): void {
    this.props.deletedAt = deletedAt;
    this.props.deletedById = deletedById;
  }

  toObject(): InvitationProps {
    return { ...this.props, roleIds: [...this.props.roleIds] };
  }

  toPublicObject(): PublicInvitationProps {
    const { tokenHash: _tokenHash, ...publicProps } = this.toObject();

    return publicProps;
  }
}
