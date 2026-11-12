import { InvitationStatus } from "../../domain/repositories/invitation-repository";

export interface InvitationPreviewDto {
  email: string;
  companyName: string;
  accountExists: boolean;
  status: InvitationStatus;
  expiresAt: Date;
}
