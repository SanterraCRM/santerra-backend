import {
  PersonOptionalField,
  PersonType,
} from "../../domain/repositories/person-repository";

export interface ListPersonsDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: PersonType;
  createdFrom?: Date;
  createdTo?: Date;
  missing?: PersonOptionalField[];
  includeDeleted?: boolean;
}
