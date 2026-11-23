import { ProductView } from "../../domain/entities/productView";
import { ProductViewFilterOptions } from "../../domain/repositories/productView-repository";

export interface ProductViewDto {
  id: number | null;
  product: string | null;
  isActive: number | null;
  manufacturerId: string | null;
  manufacturer: string | null;
  department: string | null;
  section: string | null;
  category: string | null;
  line: string | null;
  stockUnity: string | null;
  purchaseUnity: string | null;
  purchaseQuantity: number | null;
  weight: number | null;
  weightNet: number | null;
  volume: number | null;
  ncm: string | null;
  // Culturas atendidas (view de culturas), ligadas apenas pelo código do produto.
  crops: string[];
}

export type ProductViewFilterOptionsDto = ProductViewFilterOptions;

export function toProductViewDto(
  product: ProductView,
  crops: string[] = [],
): ProductViewDto {
  return {
    ...product,
    crops,
  };
}
