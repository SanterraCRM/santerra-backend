-- CreateEnum
CREATE TYPE "GoalMetric" AS ENUM ('visitas_finalizadas', 'produtores_visitados', 'acoes_comerciais', 'vendas');

-- CreateTable
CREATE TABLE "Goal" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "metric" "GoalMetric" NOT NULL,
    "targetValue" DECIMAL(14,2) NOT NULL,
    "achievedValue" DECIMAL(14,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "companyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" UUID,
    "updatedById" UUID,
    "deletedById" UUID,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Goal_companyId_deletedAt_idx" ON "Goal"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "Goal_employeeId_idx" ON "Goal"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_id_companyId_key" ON "Goal"("id", "companyId");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_employeeId_companyId_fkey" FOREIGN KEY ("employeeId", "companyId") REFERENCES "Employee"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Permissões do módulo de metas (src/shared/application/auth/permissions.ts).
INSERT INTO "Permission" ("id", "name", "description") VALUES
  ('2f9a8525-677f-479d-81c0-8f17dfba6e51', 'goals.read', 'Visualizar metas.'),
  ('586510c7-c6f3-4cd7-ad36-7cc5dad9913c', 'goals.create', 'Cadastrar metas.'),
  ('217a4dfe-2cf5-445c-9c68-693b65b49fcb', 'goals.update', 'Editar metas e lançar o valor vendido.'),
  ('dfca5eec-9412-43b0-8dd7-2ed0ee136251', 'goals.delete', 'Excluir metas.')
ON CONFLICT ("name") DO NOTHING;
