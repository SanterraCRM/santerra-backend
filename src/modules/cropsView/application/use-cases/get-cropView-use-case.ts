import { inject, injectable } from "tsyringe";

import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import {
  CROP_VIEW_REPOSITORY,
  CropViewRepository,
} from "../../domain/repositories/cropView-repository";
import { CropViewDto, toCropViewDto } from "../dtos/cropsView-dto";

@injectable()
export class GetCropViewUseCase {
  constructor(
    @inject(CROP_VIEW_REPOSITORY)
    private readonly cropRepository: CropViewRepository,
  ) {}

  async execute(
    id: number,
  ): Promise<CropViewDto> {
    const crop = await this.cropRepository.findById(
      id,
    );

    if (!crop) {
      throw new ResourceNotFoundError("Cultura não encontrada.");
    }

    return toCropViewDto(crop);
  }
}