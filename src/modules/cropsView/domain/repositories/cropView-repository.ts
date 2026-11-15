import { CropView } from "../entities/cropsView";

export const CROP_VIEW_REPOSITORY = "CropViewRepository";

export interface FindCropsViewParams {
  page: number;
  limit: number;
  search?: string;
}

export interface FindCropsViewResult {
  cropsView: CropView[];
  total: number;
}

export interface CropViewRepository {
  findByProductAndCrop(productId: number, crop: string): Promise<CropView | null>;

  findMany(
    params: FindCropsViewParams,
  ): Promise<FindCropsViewResult>;
}