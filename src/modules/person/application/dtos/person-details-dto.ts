import { PERMISSIONS } from "../../../../shared/application/auth/permissions";
import { PersonProps } from "../../domain/entities/person";
import {
  PersonDetails,
  PersonEmployee,
  PersonProducer,
  PersonType,
} from "../../domain/repositories/person-repository";

export interface PersonDetailsDto extends PersonProps {
  types: PersonType[];
  employee: PersonEmployee | null;
  producer: PersonProducer | null;
}

export function toPersonDetailsDto(
  { person, employee, producer }: PersonDetails,
  permissions: string[],
): PersonDetailsDto {
  const types: PersonType[] = [];

  if (employee) {
    types.push("employee");
  }

  if (producer) {
    types.push("producer");
  }

  return {
    ...person.toObject(),
    types,
    employee: permissions.includes(PERMISSIONS.EMPLOYEES_READ) ? employee : null,
    producer: permissions.includes(PERMISSIONS.PRODUCERS_READ) ? producer : null,
  };
}
