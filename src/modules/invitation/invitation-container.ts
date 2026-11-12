import { container } from "tsyringe";

import {
  INVITATION_REPOSITORY,
  InvitationRepository,
} from "./domain/repositories/invitation-repository";
import { PrismaInvitationRepository } from "./infrastructure/prisma/prisma-invitation-repository";

container.registerSingleton<InvitationRepository>(
  INVITATION_REPOSITORY,
  PrismaInvitationRepository,
);
