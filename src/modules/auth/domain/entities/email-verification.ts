import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";

const CODE_LENGTH = 6;
const TOKEN_BYTES = 32;

export interface EmailVerificationProps {
  id: string;
  email: string;
  codeHash: string;
  tokenHash: string | null;
  attempts: number;
  expiresAt: Date;
  verifiedAt: Date | null;
  usedAt: Date | null;
  createdAt: Date;
}

interface CreateEmailVerificationProps {
  email: string;
  codeHash: string;
  expiresAt: Date;
}

interface VerifyEmailVerificationProps {
  tokenHash: string;
  expiresAt: Date;
}

export class EmailVerification {
  static readonly MAX_ATTEMPTS = 5;

  private constructor(private readonly props: EmailVerificationProps) {}

  static create(
    input: CreateEmailVerificationProps,
    id = randomUUID(),
    createdAt = new Date(),
  ): EmailVerification {
    return new EmailVerification({
      id,
      email: input.email,
      codeHash: input.codeHash,
      tokenHash: null,
      attempts: 0,
      expiresAt: input.expiresAt,
      verifiedAt: null,
      usedAt: null,
      createdAt,
    });
  }

  static reconstitute(props: EmailVerificationProps): EmailVerification {
    return new EmailVerification({ ...props });
  }

  static createCode(): { code: string; codeHash: string } {
    const code = randomInt(0, 10 ** CODE_LENGTH)
      .toString()
      .padStart(CODE_LENGTH, "0");

    return { code, codeHash: EmailVerification.hash(code) };
  }

  static createToken(): { token: string; tokenHash: string } {
    const token = randomBytes(TOKEN_BYTES).toString("base64url");

    return { token, tokenHash: EmailVerification.hash(token) };
  }

  static hash(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get attempts(): number {
    return this.props.attempts;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  canBeVerified(now = new Date()): boolean {
    return (
      this.props.verifiedAt === null &&
      this.props.usedAt === null &&
      this.props.attempts < EmailVerification.MAX_ATTEMPTS &&
      this.props.expiresAt > now
    );
  }

  matchesCode(code: string): boolean {
    return EmailVerification.hash(code) === this.props.codeHash;
  }

  verify(input: VerifyEmailVerificationProps, verifiedAt = new Date()): void {
    this.props.tokenHash = input.tokenHash;
    this.props.expiresAt = input.expiresAt;
    this.props.verifiedAt = verifiedAt;
  }

  isVerifiedFor(email: string, now = new Date()): boolean {
    return (
      this.props.email === email &&
      this.props.verifiedAt !== null &&
      this.props.usedAt === null &&
      this.props.expiresAt > now
    );
  }

  use(usedAt = new Date()): void {
    this.props.usedAt = usedAt;
  }

  toObject(): EmailVerificationProps {
    return { ...this.props };
  }
}
