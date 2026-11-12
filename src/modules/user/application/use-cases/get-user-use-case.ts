import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { PublicUserProps } from "../../domain/entities/user";
import {
  USER_REPOSITORY,
  UserRepository,
} from "../../domain/repositories/user-repository";

@injectable()
export class GetUserUseCase {
  constructor(
    @inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<PublicUserProps> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new ResourceNotFoundError("Usuário não encontrado.");
    }

    return user.toPublicObject();
  }
}
