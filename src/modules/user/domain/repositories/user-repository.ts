import { User } from "../entities/user";

export const USER_REPOSITORY = "UserRepository";

export interface FindUsersParams {
  page: number;
  limit: number;
  search?: string;
  active?: boolean;
  includeDeleted: boolean;
}

export interface FindUsersResult {
  users: User[];
  total: number;
}

export interface UserRepository {
  create(user: User): Promise<User>;
  findById(id: string, includeDeleted?: boolean): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findMany(params: FindUsersParams): Promise<FindUsersResult>;
  update(user: User): Promise<User>;
  updateLastLogin(user: User): Promise<void>;
  delete(user: User): Promise<void>;
}
