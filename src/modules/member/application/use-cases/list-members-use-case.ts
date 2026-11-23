import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  MEMBER_REPOSITORY,
  MemberRepository,
} from "../../domain/repositories/member-repository";
import { ListMembersDto } from "../dtos/list-members-dto";
import { MemberDetailsDto, toMemberDetailsDto } from "../dtos/member-details-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListMembersUseCase {
  constructor(
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute(
    input: ListMembersDto,
    context: TenantContext,
  ): Promise<PaginatedDto<MemberDetailsDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.memberRepository.findMany({
      companyId: context.companyId,
      page,
      limit,
      search,
      active: input.active,
      roleId: input.roleId,
      hasWallet: input.hasWallet,
      sort: input.sort,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.members.map((details) => toMemberDetailsDto(details, context)),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
