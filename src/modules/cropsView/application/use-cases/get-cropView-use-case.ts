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
    productId: number,
    crop: string,
  ): Promise<CropViewDto> {
    const crops = await this.cropRepository.findByProductAndCrop(
      productId,
      crop
    );

    if (!crops) {
      throw new ResourceNotFoundError("Cultura não encontrada.");
    }

    return toCropViewDto(crops);
  }
}