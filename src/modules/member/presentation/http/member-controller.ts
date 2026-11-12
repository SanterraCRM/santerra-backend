import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { DeleteMemberUseCase } from "../../application/use-cases/delete-member-use-case";
import { GetMemberUseCase } from "../../application/use-cases/get-member-use-case";
import { ListMembersUseCase } from "../../application/use-cases/list-members-use-case";
import { UpdateMemberUseCase } from "../../application/use-cases/update-member-use-case";
import { listMembersQuerySchema, updateMemberSchema } from "./member-schemas";

@injectable()
export class MemberController {
  constructor(
    private readonly listMembersUseCase: ListMembersUseCase,
    private readonly getMemberUseCase: GetMemberUseCase,
    private readonly updateMemberUseCase: UpdateMemberUseCase,
    private readonly deleteMemberUseCase: DeleteMemberUseCase,
  ) {}

  list: RequestHandler = async (request, response) => {
    const result = await this.listMembersUseCase.execute(
      listMembersQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const member = await this.getMemberUseCase.execute(
      id,
      getTenantContext(request),
    );

    response.status(200).json(member);
  };

  update: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    const member = await this.updateMemberUseCase.execute(
      id,
      updateMemberSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(200).json(member);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteMemberUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };
}
