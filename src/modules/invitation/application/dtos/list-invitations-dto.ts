import { InvitationStatus } from "../../domain/repositories/invitation-repository";

export interface ListInvitationsDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvitationStatus;
  includeDeleted?: boolean;
}
