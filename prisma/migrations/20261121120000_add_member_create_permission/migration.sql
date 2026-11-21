-- Permissão de adicionar membros direto, sem convite (src/shared/application/auth/permissions.ts).
INSERT INTO "Permission" ("id", "name", "description") VALUES
  ('0bc83b86-2a72-41bd-8bae-f2d2e4ef0c13', 'members.create', 'Adicionar membros à empresa sem convite.')
ON CONFLICT ("name") DO NOTHING;

-- Quem já convidava (invitations.create) passa a adicionar membros direto.
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT "RolePermission"."roleId", "create"."id"
FROM "RolePermission"
JOIN "Permission" AS "invite" ON "invite"."id" = "RolePermission"."permissionId" AND "invite"."name" = 'invitations.create'
CROSS JOIN (SELECT "id" FROM "Permission" WHERE "name" = 'members.create') AS "create"
ON CONFLICT DO NOTHING;
