import { File } from "../entities/file";

export const FILE_REPOSITORY = "FileRepository";

export interface FindFilesParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  includeDeleted: boolean;
}

export interface FindFilesResult {
  files: File[];
  total: number;
}

export interface FileRepository {
  create(file: File): Promise<File>;
  findById(
    id: string,
    companyId: string,
    includeDeleted?: boolean,
  ): Promise<File | null>;
  findManyByIds(ids: string[], companyId: string): Promise<File[]>;
  findMany(params: FindFilesParams): Promise<FindFilesResult>;
  update(file: File): Promise<File>;
  delete(file: File): Promise<void>;
  deleteUnlinked(ids: string[], companyId: string, deletedById: string | null): Promise<void>;
}
