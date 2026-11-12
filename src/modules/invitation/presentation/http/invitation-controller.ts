import { RequestHandler } from "express";
import { injectable } from "tsyringe";

import { getTenantContext } from "../../../../shared/http/request-context";
import { idParamSchema } from "../../../../shared/http/request-schemas";
import { AcceptInvitationUseCase } from "../../application/use-cases/accept-invitation-use-case";
import { CreateInvitationUseCase } from "../../application/use-cases/create-invitation-use-case";
import { DeleteInvitationUseCase } from "../../application/use-cases/delete-invitation-use-case";
import { ListInvitationsUseCase } from "../../application/use-cases/list-invitations-use-case";
import { PreviewInvitationUseCase } from "../../application/use-cases/preview-invitation-use-case";
import {
  acceptInvitationSchema,
  createInvitationSchema,
  listInvitationsQuerySchema,
  previewInvitationQuerySchema,
} from "./invitation-schemas";

@injectable()
export class InvitationController {
  constructor(
    private readonly createInvitationUseCase: CreateInvitationUseCase,
    private readonly listInvitationsUseCase: ListInvitationsUseCase,
    private readonly deleteInvitationUseCase: DeleteInvitationUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
    private readonly previewInvitationUseCase: PreviewInvitationUseCase,
  ) {}

  preview: RequestHandler = async (request, response) => {
    const { token } = previewInvitationQuerySchema.parse(request.query);
    const preview = await this.previewInvitationUseCase.execute(token);

    response.status(200).json(preview);
  };

  create: RequestHandler = async (request, response) => {
    const invitation = await this.createInvitationUseCase.execute(
      createInvitationSchema.parse(request.body),
      getTenantContext(request),
    );

    response.status(201).json(invitation);
  };

  list: RequestHandler = async (request, response) => {
    const result = await this.listInvitationsUseCase.execute(
      listInvitationsQuerySchema.parse(request.query),
      getTenantContext(request),
    );

    response.status(200).json(result);
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = idParamSchema.parse(request.params);
    await this.deleteInvitationUseCase.execute(id, getTenantContext(request));

    response.status(204).send();
  };

  accept: RequestHandler = async (request, response) => {
    const result = await this.acceptInvitationUseCase.execute(
      acceptInvitationSchema.parse(request.body),
    );

    response.status(200).json(result);
  };
}
