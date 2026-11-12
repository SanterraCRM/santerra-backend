import { CreateEmployeeDto } from "../../../employee/application/dtos/create-employee-dto";
import { CreateProducerDto } from "../../../producer/application/dtos/create-producer-dto";

export interface CreatePersonDto {
  name: string;
  nationalId?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  employee?: Omit<CreateEmployeeDto, "personId">;
  producer?: Omit<CreateProducerDto, "personId">;
}
