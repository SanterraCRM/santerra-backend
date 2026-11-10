import { PublicManufacturerProps } from "../../domain/entities/manufacturer";

export type ManufacturerListItemDto = PublicManufacturerProps & {
  productsCount: number;
};
