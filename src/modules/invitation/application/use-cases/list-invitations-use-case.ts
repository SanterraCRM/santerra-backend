import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import { PublicInvitationProps } from "../../domain/entities/invitation";
import {
  INVITATION_REPOSITORY,
  InvitationRepository,
} from "../../domain/repositories/invitation-repository";
import { ListInvitationsDto } from "../dtos/list-invitations-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListInvitationsUseCase {
  constructor(
    @inject(INVITATION_REPOSITORY)
    private readonly invitationRepository: InvitationRepository,
  ) {}

  async execute(
    input: ListInvitationsDto,
    context: TenantContext,
  ): Promise<PaginatedDto<PublicInvitationProps>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.invitationRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      status: input.status,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.invitations.map((invitation) => invitation.toPublicObject()),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
