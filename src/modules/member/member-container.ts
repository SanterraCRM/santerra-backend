import { container } from "tsyringe";

import {
  MEMBER_REPOSITORY,
  MemberRepository,
} from "./domain/repositories/member-repository";
import { PrismaMemberRepository } from "./infrastructure/prisma/prisma-member-repository";

container.registerSingleton<MemberRepository>(
  MEMBER_REPOSITORY,
  PrismaMemberRepository,
);
