-- Permissões do módulo de produtores (src/shared/application/auth/permissions.ts).
INSERT INTO "Permission" ("id", "name", "description") VALUES
  ('e11b42f5-1b5b-41b5-8595-71482ef5e0c4', 'producers.read', 'Visualizar produtores.'),
  ('ab0deb34-ed00-4c9b-a4b2-92f6789fc1a7', 'producers.create', 'Cadastrar produtores.'),
  ('1f9e905b-2286-42a7-9ff5-08999b8623bb', 'producers.update', 'Editar produtores.'),
  ('fb316d6d-6bbd-40a5-838a-1d41320baf28', 'producers.delete', 'Excluir produtores.')
ON CONFLICT ("name") DO NOTHING;
