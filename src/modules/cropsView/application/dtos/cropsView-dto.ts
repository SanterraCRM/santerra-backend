import { CropView } from "../../domain/entities/cropsView";

export interface CropViewDto {
  productId: number | null;
  description: string | null;
  activeIngredient: string | null;
  crop: string | null;
}

export function toCropViewDto(
  crop: CropView,
): CropViewDto {
  return {
    ...crop,
  };
}