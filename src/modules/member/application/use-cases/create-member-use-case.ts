import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import {
  MEMBER_REPOSITORY,
  MemberRepository,
} from "../../domain/repositories/member-repository";
import { CreateMemberDto } from "../dtos/create-member-dto";
import { CreateMemberResultDto } from "../dtos/create-member-result-dto";
import { toMemberDetailsDto } from "../dtos/member-details-dto";
import { MemberAccessBuilder } from "../services/member-access-builder";

@injectable()
export class CreateMemberUseCase {
  constructor(
    @inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
    private readonly memberAccessBuilder: MemberAccessBuilder,
  ) {}

  async execute(
    input: CreateMemberDto,
    context: TenantContext,
  ): Promise<CreateMemberResultDto> {
    const access = await this.memberAccessBuilder.build(input, context);
    const addedMember = await this.memberRepository.add(access);

    return {
      member: toMemberDetailsDto(addedMember, context),
      accountCreated: access.newUser !== null,
    };
  }
}
