export interface UpdateEmployeeDto {
  personId?: string;
  userCompanyId?: string | null;
  hiredAt?: Date | null;
  terminatedAt?: Date | null;
}
