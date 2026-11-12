-- Permissões do módulo de eventos (src/shared/application/auth/permissions.ts).
INSERT INTO "Permission" ("id", "name", "description") VALUES
  ('632a4ad0-8724-49ac-b6d6-2fc4bd01b27a', 'events.read', 'Visualizar eventos.'),
  ('4170181a-ed73-4285-8895-a5b5762eb60f', 'events.create', 'Cadastrar eventos.'),
  ('aff5d97b-9f96-4626-a28b-62407e06dc32', 'events.update', 'Editar eventos.'),
  ('d8381af3-3ce5-45de-b4e9-5163e65ff864', 'events.delete', 'Excluir eventos.')
ON CONFLICT ("name") DO NOTHING;
