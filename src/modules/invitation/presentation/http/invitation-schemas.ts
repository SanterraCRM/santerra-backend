import { z } from "zod";

import {
  listQuerySchema,
  passwordSchema,
} from "../../../../shared/http/request-schemas";
import { INVITATION_STATUSES } from "../../domain/repositories/invitation-repository";

export const createInvitationSchema = z.object({
  email: z.email(),
  roleIds: z.array(z.uuid()).optional(),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
  name: z.string().optional(),
  password: passwordSchema.optional(),
});

export const previewInvitationQuerySchema = z.object({
  token: z.string().min(1),
});

export const listInvitationsQuerySchema = listQuerySchema.extend({
  status: z.enum(INVITATION_STATUSES).optional(),
});
