import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { FILE_REPOSITORY, FileRepository } from "../../../file";
import { GROUP_REPOSITORY, GroupRepository } from "../../../group";
import { MANUFACTURER_REPOSITORY, ManufacturerRepository } from "../../../manufacturer";
import { Product } from "../../domain/entities/product";
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from "../../domain/repositories/product-repository";
import { CreateProductDto } from "../dtos/create-product-dto";
import { ProductDetailsDto, toProductDetailsDto } from "../dtos/product-details-dto";

@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @inject(MANUFACTURER_REPOSITORY)
    private readonly manufacturerRepository: ManufacturerRepository,
    @inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
    @inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
  ) {}

  async execute(
    input: CreateProductDto,
    context: TenantContext,
  ): Promise<ProductDetailsDto> {
    const product = Product.create({
      ...input,
      companyId: context.companyId,
      createdById: context.userId,
    });

    if (!(await this.manufacturerRepository.findById(product.manufacturerId))) {
      throw new ResourceNotFoundError("Fabricante não encontrado.");
    }

    const groups = await this.groupRepository.findManyByIds(
      product.groupIds,
      context.companyId,
    );

    if (groups.length !== product.groupIds.length) {
      throw new ResourceNotFoundError("Grupo não encontrado.");
    }

    const files = await this.fileRepository.findManyByIds(product.fileIds, context.companyId);

    if (files.length !== product.fileIds.length) {
      throw new ResourceNotFoundError("Arquivo não encontrado.");
    }

    const createdProduct = await this.productRepository.create(product);

    return toProductDetailsDto(createdProduct, context);
  }
}
