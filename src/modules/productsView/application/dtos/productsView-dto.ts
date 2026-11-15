import { ProductView } from "../../domain/entities/productView";

export interface ProductViewDto {
  id: number;
  product: string;
  isActive: number;
  manufacturerId: string;
  manufacturer: string;
  department: string;
  section: string;
  category: string;
  line: string;
  stockUnity: string;
  purchaseUnity: string;
  purchaseQuantity: number;
  weight: number;
  weightNet: number;
  volume: number;
  ncm: string;
}

export function toProductViewDto(
  product: ProductView,
): ProductViewDto {
  return {
    ...product,
  };
}