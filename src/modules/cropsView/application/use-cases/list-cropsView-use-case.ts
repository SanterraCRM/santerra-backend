import { inject, injectable } from "tsyringe";

import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  CROP_VIEW_REPOSITORY,
  CropViewRepository,
} from "../../domain/repositories/cropView-repository";
import { CropViewDto } from "../dtos/cropsView-dto";
import { toCropViewDto } from "../dtos/cropsView-dto";
import { ListCropsViewDto } from "../dtos/list-cropsView-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListCropsViewUseCase {
  constructor(
    @inject(CROP_VIEW_REPOSITORY)
    private readonly cropRepository: CropViewRepository,
  ) {}

  async execute(
    input: ListCropsViewDto,
  ): Promise<PaginatedDto<CropViewDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;
    const search = input.search?.trim() || undefined;

    const result = await this.cropRepository.findMany({
      page,
      limit,
      search,
    });

    return {
      data: result.cropsView.map(toCropViewDto),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}