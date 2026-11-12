-- Tipo e tamanho do conteúdo enviado no upload. NOT NULL sem default: nenhum código gravava em "File" antes do módulo de arquivos.
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;

-- Permissões do módulo de arquivos (src/shared/application/auth/permissions.ts).
INSERT INTO "Permission" ("id", "name", "description") VALUES
  ('5df5081f-fe6d-4d46-8f15-6c8357da6121', 'files.read', 'Visualizar e baixar arquivos.'),
  ('8f9d492e-8246-4443-b65b-78a914b9c2dc', 'files.create', 'Enviar arquivos.'),
  ('0377d372-7652-40d1-bf73-7fe1b84de948', 'files.update', 'Renomear arquivos.'),
  ('646f4a90-c9b4-4aeb-816b-547672c76eb7', 'files.delete', 'Excluir arquivos.')
ON CONFLICT ("name") DO NOTHING;
