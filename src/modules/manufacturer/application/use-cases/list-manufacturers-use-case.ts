import { inject, injectable } from "tsyringe";

import { PaginatedDto } from "../../../../shared/dtos/paginated-dto";
import {
  MANUFACTURER_REPOSITORY,
  ManufacturerRepository,
} from "../../domain/repositories/manufacturer-repository";
import { ListManufacturersDto } from "../dtos/list-manufacturers-dto";
import { ManufacturerListItemDto } from "../dtos/manufacturer-list-item-dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class ListManufacturersUseCase {
  constructor(
    @inject(MANUFACTURER_REPOSITORY)
    private readonly manufacturerRepository: ManufacturerRepository,
  ) {}

  async execute(
    input: ListManufacturersDto,
  ): Promise<PaginatedDto<ManufacturerListItemDto>> {
    const page = input.page ?? DEFAULT_PAGE;
    const limit = input.limit ?? DEFAULT_LIMIT;

    const search = input.search?.trim() || undefined;
    const result = await this.manufacturerRepository.findMany({
      page,
      limit,
      search,
      createdFrom: input.createdFrom,
      createdTo: input.createdTo,
      missing: input.missing,
      includeDeleted: input.includeDeleted ?? false,
    });

    return {
      data: result.manufacturers.map(({ manufacturer, productsCount }) => ({
        ...manufacturer.toPublicObject(),
        productsCount,
      })),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
