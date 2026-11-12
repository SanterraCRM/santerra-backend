import { File as PrismaFile } from "@prisma/client";

import { File } from "../../domain/entities/file";

export class PrismaFileMapper {
  static toDomain(raw: PrismaFile): File {
    return File.reconstitute({
      id: raw.id,
      originalName: raw.originalName,
      mimeType: raw.mimeType,
      size: raw.size,
      url: raw.url,
      companyId: raw.companyId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      createdById: raw.createdById,
      updatedById: raw.updatedById,
      deletedById: raw.deletedById,
    });
  }
}
