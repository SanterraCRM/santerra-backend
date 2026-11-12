import { inject, injectable } from "tsyringe";

import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ForbiddenError, ResourceNotFoundError } from "../../../../shared/errors/app-error";
import { FILE_REPOSITORY, FileRepository } from "../../../file";
import { GROUP_REPOSITORY, GroupRepository } from "../../../group";
import { MANUFACTURER_REPOSITORY, ManufacturerRepository } from "../../../manufacturer";
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from "../../domain/repositories/product-repository";
import { ProductDetailsDto, toProductDetailsDto } from "../dtos/product-details-dto";
import { UpdateProductDto } from "../dtos/update-product-dto";

@injectable()
export class UpdateProductUseCase {
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
    id: string,
    input: UpdateProductDto,
    context: TenantContext,
  ): Promise<ProductDetailsDto> {
    const product = await this.productRepository.findById(id, context.companyId);

    if (!product) {
      throw new ResourceNotFoundError("Produto não encontrado.");
    }

    const previousFileIds = product.fileIds;
    product.update({ ...input, updatedById: context.userId });
    const removedFileIds = previousFileIds.filter((fileId) => !product.fileIds.includes(fileId));

    if (removedFileIds.length > 0 && !context.permissions.includes(PERMISSIONS.FILES_DELETE)) {
      throw new ForbiddenError("Você não tem permissão para remover anexos.");
    }

    if (
      input.manufacturerId !== undefined &&
      !(await this.manufacturerRepository.findById(product.manufacturerId))
    ) {
      throw new ResourceNotFoundError("Fabricante não encontrado.");
    }

    if (input.groupIds !== undefined) {
      const groups = await this.groupRepository.findManyByIds(
        product.groupIds,
        context.companyId,
      );

      if (groups.length !== product.groupIds.length) {
        throw new ResourceNotFoundError("Grupo não encontrado.");
      }
    }

    if (input.fileIds !== undefined) {
      const files = await this.fileRepository.findManyByIds(product.fileIds, context.companyId);

      if (files.length !== product.fileIds.length) {
        throw new ResourceNotFoundError("Arquivo não encontrado.");
      }
    }

    const updatedProduct = await this.productRepository.update(product);
    await this.fileRepository.deleteUnlinked(removedFileIds, context.companyId, context.userId);

    return toProductDetailsDto(updatedProduct, context);
  }
}
