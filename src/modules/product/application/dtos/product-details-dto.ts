import { TenantContext } from "../../../../shared/application/auth/auth-context";
import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { ProductProps } from "../../domain/entities/product";
import { ProductDetails, ProductFile } from "../../domain/repositories/product-repository";

export interface ProductDetailsDto extends ProductProps {
  manufacturer: { id: string; name: string };
  groups: { id: string; name: string }[];
  files: ProductFile[] | null;
}

export function toProductDetailsDto(
  { product, manufacturer, groups, files }: ProductDetails,
  context: TenantContext,
): ProductDetailsDto {
  return {
    ...product.toObject(),
    manufacturer,
    groups,
    files: context.permissions.includes(PERMISSIONS.FILES_READ) ? files : null,
  };
}
