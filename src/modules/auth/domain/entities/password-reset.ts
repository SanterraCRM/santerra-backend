import { createHash, randomBytes, randomUUID } from "node:crypto";

const TOKEN_BYTES = 32;

export interface PasswordResetProps {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

interface CreatePasswordResetProps {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export class PasswordReset {
  private constructor(private readonly props: PasswordResetProps) {}

  static create(
    input: CreatePasswordResetProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): PasswordReset {
    return new PasswordReset({
      id,
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      usedAt: null,
      createdAt,
    });
  }

  static reconstitute(props: PasswordResetProps): PasswordReset {
    return new PasswordReset({ ...props });
  }

  static createToken(): { token: string; tokenHash: string } {
    const token = randomBytes(TOKEN_BYTES).toString("base64url");

    return { token, tokenHash: PasswordReset.hashToken(token) };
  }

  static hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  get userId(): string {
    return this.props.userId;
  }

  isPending(now = new Date()): boolean {
    return this.props.usedAt === null && this.props.expiresAt > now;
  }

  use(usedAt = new Date()): void {
    this.props.usedAt = usedAt;
  }

  toObject(): PasswordResetProps {
    return { ...this.props };
  }
}
