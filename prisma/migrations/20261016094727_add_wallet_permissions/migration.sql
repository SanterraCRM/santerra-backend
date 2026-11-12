-- Permissões do módulo de carteiras (src/shared/application/auth/permissions.ts).
INSERT INTO "Permission" ("id", "name", "description") VALUES
  ('7de2e34e-3e00-498a-8add-64f68facc5f9', 'wallets.read', 'Visualizar carteiras.'),
  ('3c23c90a-db61-42d5-abdf-7d5e5c49643d', 'wallets.create', 'Cadastrar carteiras.'),
  ('8118b64d-4051-44a1-8dfb-aac0ac60c268', 'wallets.update', 'Editar carteiras.'),
  ('1314e16e-3842-4a1a-9194-816abe72c4c2', 'wallets.delete', 'Excluir carteiras.')
ON CONFLICT ("name") DO NOTHING;
