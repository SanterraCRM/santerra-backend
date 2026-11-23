-- CreateEnum
CREATE TYPE "WalletMovementType" AS ENUM ('saldo_inicial', 'ajuste', 'debito_acao', 'estorno_acao');

-- CreateTable
CREATE TABLE "WalletMovement" (
    "id" UUID NOT NULL,
    "sequence" SERIAL NOT NULL,
    "walletId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "type" "WalletMovementType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "balanceAfter" DECIMAL(14,2) NOT NULL,
    "reason" TEXT,
    "commercialActionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "WalletMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletMovement_walletId_sequence_idx" ON "WalletMovement"("walletId", "sequence");

-- CreateIndex
CREATE INDEX "WalletMovement_commercialActionId_idx" ON "WalletMovement"("commercialActionId");

-- AddForeignKey
ALTER TABLE "WalletMovement" ADD CONSTRAINT "WalletMovement_walletId_companyId_fkey" FOREIGN KEY ("walletId", "companyId") REFERENCES "Wallet"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletMovement" ADD CONSTRAINT "WalletMovement_commercialActionId_companyId_fkey" FOREIGN KEY ("commercialActionId", "companyId") REFERENCES "CommercialAction"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletMovement" ADD CONSTRAINT "WalletMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Permissão de ajuste de saldo das carteiras (src/shared/application/auth/permissions.ts).
INSERT INTO "Permission" ("id", "name", "description") VALUES
  ('b7f98057-9bcf-4063-a791-a268af56cf61', 'wallets.adjust', 'Ajustar o saldo das carteiras (acrescentar ou diminuir, com motivo).')
ON CONFLICT ("name") DO NOTHING;

-- Quem já creditava carteiras (wallets.update) passa a ajustar o saldo.
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT "RolePermission"."roleId", "adjust"."id"
FROM "RolePermission"
JOIN "Permission" AS "update" ON "update"."id" = "RolePermission"."permissionId" AND "update"."name" = 'wallets.update'
CROSS JOIN (SELECT "id" FROM "Permission" WHERE "name" = 'wallets.adjust') AS "adjust"
ON CONFLICT DO NOTHING;

-- O extrato de cada carteira começa com o saldo atual.
INSERT INTO "WalletMovement" ("id", "walletId", "companyId", "type", "amount", "balanceAfter", "reason", "createdAt")
SELECT gen_random_uuid(), "id", "companyId", 'saldo_inicial', "value", "value", 'Saldo da carteira quando o extrato começou.', CURRENT_TIMESTAMP
FROM "Wallet"
WHERE "value" <> 0
ORDER BY "createdAt", "id";
