import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  MEMBER_REPOSITORY,
  MemberRepository,
} from "../../domain/repositories/member-repository";
import { MemberDetailsDto, toMemberDetailsDto } from "../dtos/member-details-dto";

@injectable()
export class GetMemberUseCase {
  constructor(
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute(id: string, context: TenantContext): Promise<MemberDetailsDto> {
    const member = await this.memberRepository.findDetailsById(id, context.companyId);

    if (!member) {
      throw new ResourceNotFoundError("Membro não encontrado.");
    }

    return toMemberDetailsDto(member, context);
  }
}
