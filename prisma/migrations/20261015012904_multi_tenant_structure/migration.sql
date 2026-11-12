-- Estrutura multi-tenant:
-- - User vira conta global (name, isPlatformAdmin) e deixa de apontar para Person.
-- - Person passa a pertencer a uma empresa (companyId).
-- - UserCompany é o vínculo N:N entre User e Company (com dono, isOwner, e auditoria);
--   UserRole e Wallet passam a apontar para ele.
-- - FKs entre tabelas de tenant viram compostas ([xId, companyId] -> [id, companyId]).
-- - EmployeeRole sai (papel de acesso fica só em UserRole) e CommercialActionGuest é
--   separado em CommercialActionProducerGuest e CommercialActionResellerGuest.
-- - onDelete Cascade vira Restrict onde o pai usa soft delete.
-- - Unicidade com soft delete vira índice único parcial, e o catálogo de permissões é
--   inserido aqui (ambos no final do arquivo).
--
-- As colunas obrigatórias novas (User.name, Person.companyId, UserCompany.userId, ...) não têm
-- default: a migration assume essas tabelas vazias, já que a estrutura anterior delas não era
-- usável pela aplicação. Em um banco com dados nelas, a migration falha ao adicionar essas colunas.

-- DropForeignKey
ALTER TABLE "CommercialAction" DROP CONSTRAINT "CommercialAction_eventId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialAction" DROP CONSTRAINT "CommercialAction_responsibleId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialAction" DROP CONSTRAINT "CommercialAction_walletId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialActionGuest" DROP CONSTRAINT "CommercialActionGuest_commercialActionId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialActionGuest" DROP CONSTRAINT "CommercialActionGuest_producerId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialActionGuest" DROP CONSTRAINT "CommercialActionGuest_resellerId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialActionParticipant" DROP CONSTRAINT "CommercialActionParticipant_commercialActionId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialActionParticipant" DROP CONSTRAINT "CommercialActionParticipant_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialTrip" DROP CONSTRAINT "CommercialTrip_producerId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialTrip" DROP CONSTRAINT "CommercialTrip_responsibleId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialTripParticipant" DROP CONSTRAINT "CommercialTripParticipant_commercialTripId_fkey";

-- DropForeignKey
ALTER TABLE "CommercialTripParticipant" DROP CONSTRAINT "CommercialTripParticipant_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_personId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeRole" DROP CONSTRAINT "EmployeeRole_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeRole" DROP CONSTRAINT "EmployeeRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "FileCommercialAction" DROP CONSTRAINT "FileCommercialAction_commercialActionId_fkey";

-- DropForeignKey
ALTER TABLE "FileCommercialAction" DROP CONSTRAINT "FileCommercialAction_fileId_fkey";

-- DropForeignKey
ALTER TABLE "FileCommercialTrip" DROP CONSTRAINT "FileCommercialTrip_commercialTripId_fkey";

-- DropForeignKey
ALTER TABLE "FileCommercialTrip" DROP CONSTRAINT "FileCommercialTrip_fileId_fkey";

-- DropForeignKey
ALTER TABLE "FileProduct" DROP CONSTRAINT "FileProduct_fileId_fkey";

-- DropForeignKey
ALTER TABLE "FileProduct" DROP CONSTRAINT "FileProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "Producer" DROP CONSTRAINT "Producer_personId_fkey";

-- DropForeignKey
ALTER TABLE "Producer" DROP CONSTRAINT "Producer_potentialId_fkey";

-- DropForeignKey
ALTER TABLE "ProductGroup" DROP CONSTRAINT "ProductGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ProductGroup" DROP CONSTRAINT "ProductGroup_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductRecommendation" DROP CONSTRAINT "ProductRecommendation_commercialTripId_fkey";

-- DropForeignKey
ALTER TABLE "ProductRecommendation" DROP CONSTRAINT "ProductRecommendation_productId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_personId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userCompanyId_fkey";

-- DropForeignKey
ALTER TABLE "UserCompany" DROP CONSTRAINT "UserCompany_personId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropIndex
DROP INDEX "Employee_personId_key";

-- DropIndex
DROP INDEX "Producer_personId_key";

-- DropIndex
DROP INDEX "RolePermission_roleId_permissionId_key";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_personId_key";

-- DropIndex
DROP INDEX "UserCompany_personId_companyId_key";

-- DropIndex
DROP INDEX "UserRole_roleId_userId_key";

-- Backfill: updatedAt passa a ser obrigatório nestas tabelas.
UPDATE "Company" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Employee" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Event" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Person" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Potential" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Producer" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Reseller" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Role" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "User" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Wallet" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- AlterTable
ALTER TABLE "CommercialActionParticipant" ADD COLUMN     "companyId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "CommercialTripParticipant" ADD COLUMN     "companyId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "userCompanyId" UUID,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "FileCommercialAction" ADD COLUMN     "companyId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "FileCommercialTrip" ADD COLUMN     "companyId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "FileProduct" ADD COLUMN     "companyId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "companyId" UUID NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Potential" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Producer" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductGroup" ADD COLUMN     "companyId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ProductRecommendation" ADD COLUMN     "companyId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Reseller" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "personId",
DROP COLUMN "userCompanyId",
ADD COLUMN     "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserCompany" DROP COLUMN "personId",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" UUID,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" UUID,
ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" UUID,
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_pkey",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "companyId" UUID NOT NULL,
ADD COLUMN     "userCompanyId" UUID NOT NULL,
ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("roleId", "userCompanyId");

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "userId",
ADD COLUMN     "userCompanyId" UUID NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- DropTable
DROP TABLE "CommercialActionGuest";

-- DropTable
DROP TABLE "EmployeeRole";

-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "companyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" UUID,
    "updatedById" UUID,
    "deletedById" UUID,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationRole" (
    "invitationId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "companyId" UUID NOT NULL,

    CONSTRAINT "InvitationRole_pkey" PRIMARY KEY ("invitationId","roleId")
);

-- CreateTable
CREATE TABLE "CommercialActionProducerGuest" (
    "id" UUID NOT NULL,
    "commercialActionId" UUID NOT NULL,
    "producerId" UUID NOT NULL,
    "companyId" UUID NOT NULL,

    CONSTRAINT "CommercialActionProducerGuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercialActionResellerGuest" (
    "id" UUID NOT NULL,
    "commercialActionId" UUID NOT NULL,
    "resellerId" UUID NOT NULL,
    "companyId" UUID NOT NULL,

    CONSTRAINT "CommercialActionResellerGuest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_companyId_deletedAt_idx" ON "Invitation"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_id_companyId_key" ON "Invitation"("id", "companyId");

-- CreateIndex
CREATE INDEX "InvitationRole_roleId_idx" ON "InvitationRole"("roleId");

-- CreateIndex
CREATE INDEX "CommercialActionProducerGuest_producerId_idx" ON "CommercialActionProducerGuest"("producerId");

-- CreateIndex
CREATE UNIQUE INDEX "CommercialActionProducerGuest_commercialActionId_producerId_key" ON "CommercialActionProducerGuest"("commercialActionId", "producerId");

-- CreateIndex
CREATE INDEX "CommercialActionResellerGuest_resellerId_idx" ON "CommercialActionResellerGuest"("resellerId");

-- CreateIndex
CREATE UNIQUE INDEX "CommercialActionResellerGuest_commercialActionId_resellerId_key" ON "CommercialActionResellerGuest"("commercialActionId", "resellerId");

-- CreateIndex
CREATE INDEX "CommercialAction_companyId_deletedAt_idx" ON "CommercialAction"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommercialAction_id_companyId_key" ON "CommercialAction"("id", "companyId");

-- CreateIndex
CREATE INDEX "CommercialTrip_companyId_deletedAt_idx" ON "CommercialTrip"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommercialTrip_id_companyId_key" ON "CommercialTrip"("id", "companyId");

-- CreateIndex
CREATE INDEX "Company_deletedAt_idx" ON "Company"("deletedAt");

-- CreateIndex
CREATE INDEX "Employee_companyId_deletedAt_idx" ON "Employee"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_id_companyId_key" ON "Employee"("id", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userCompanyId_companyId_key" ON "Employee"("userCompanyId", "companyId");

-- CreateIndex
CREATE INDEX "Event_companyId_deletedAt_idx" ON "Event"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_id_companyId_key" ON "Event"("id", "companyId");

-- CreateIndex
CREATE INDEX "File_companyId_deletedAt_idx" ON "File"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "File_id_companyId_key" ON "File"("id", "companyId");

-- CreateIndex
CREATE INDEX "Group_companyId_deletedAt_idx" ON "Group"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Group_id_companyId_key" ON "Group"("id", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "Person_companyId_deletedAt_idx" ON "Person"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Person_id_companyId_key" ON "Person"("id", "companyId");

-- CreateIndex
CREATE INDEX "Potential_companyId_deletedAt_idx" ON "Potential"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Potential_id_companyId_key" ON "Potential"("id", "companyId");

-- CreateIndex
CREATE INDEX "Producer_companyId_deletedAt_idx" ON "Producer"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "Producer_potentialId_idx" ON "Producer"("potentialId");

-- CreateIndex
CREATE UNIQUE INDEX "Producer_id_companyId_key" ON "Producer"("id", "companyId");

-- CreateIndex
CREATE INDEX "Product_companyId_deletedAt_idx" ON "Product"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_companyId_key" ON "Product"("id", "companyId");

-- CreateIndex
CREATE INDEX "Reseller_companyId_deletedAt_idx" ON "Reseller"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reseller_id_companyId_key" ON "Reseller"("id", "companyId");

-- CreateIndex
CREATE INDEX "Role_companyId_deletedAt_idx" ON "Role"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Role_id_companyId_key" ON "Role"("id", "companyId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "UserCompany_companyId_deletedAt_idx" ON "UserCompany"("companyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompany_userId_companyId_key" ON "UserCompany"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompany_id_companyId_key" ON "UserCompany"("id", "companyId");

-- CreateIndex
CREATE INDEX "UserRole_userCompanyId_idx" ON "UserRole"("userCompanyId");

-- CreateIndex
CREATE INDEX "Wallet_userCompanyId_deletedAt_idx" ON "Wallet"("userCompanyId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_id_companyId_key" ON "Wallet"("id", "companyId");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userCompanyId_companyId_fkey" FOREIGN KEY ("userCompanyId", "companyId") REFERENCES "UserCompany"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_companyId_fkey" FOREIGN KEY ("roleId", "companyId") REFERENCES "Role"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userCompanyId_companyId_fkey" FOREIGN KEY ("userCompanyId", "companyId") REFERENCES "UserCompany"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationRole" ADD CONSTRAINT "InvitationRole_invitationId_companyId_fkey" FOREIGN KEY ("invitationId", "companyId") REFERENCES "Invitation"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationRole" ADD CONSTRAINT "InvitationRole_roleId_companyId_fkey" FOREIGN KEY ("roleId", "companyId") REFERENCES "Role"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_personId_companyId_fkey" FOREIGN KEY ("personId", "companyId") REFERENCES "Person"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userCompanyId_companyId_fkey" FOREIGN KEY ("userCompanyId", "companyId") REFERENCES "UserCompany"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producer" ADD CONSTRAINT "Producer_personId_companyId_fkey" FOREIGN KEY ("personId", "companyId") REFERENCES "Person"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producer" ADD CONSTRAINT "Producer_potentialId_companyId_fkey" FOREIGN KEY ("potentialId", "companyId") REFERENCES "Potential"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialAction" ADD CONSTRAINT "CommercialAction_eventId_companyId_fkey" FOREIGN KEY ("eventId", "companyId") REFERENCES "Event"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialAction" ADD CONSTRAINT "CommercialAction_walletId_companyId_fkey" FOREIGN KEY ("walletId", "companyId") REFERENCES "Wallet"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialAction" ADD CONSTRAINT "CommercialAction_responsibleId_companyId_fkey" FOREIGN KEY ("responsibleId", "companyId") REFERENCES "Employee"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialActionProducerGuest" ADD CONSTRAINT "CommercialActionProducerGuest_commercialActionId_companyId_fkey" FOREIGN KEY ("commercialActionId", "companyId") REFERENCES "CommercialAction"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialActionProducerGuest" ADD CONSTRAINT "CommercialActionProducerGuest_producerId_companyId_fkey" FOREIGN KEY ("producerId", "companyId") REFERENCES "Producer"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialActionResellerGuest" ADD CONSTRAINT "CommercialActionResellerGuest_commercialActionId_companyId_fkey" FOREIGN KEY ("commercialActionId", "companyId") REFERENCES "CommercialAction"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialActionResellerGuest" ADD CONSTRAINT "CommercialActionResellerGuest_resellerId_companyId_fkey" FOREIGN KEY ("resellerId", "companyId") REFERENCES "Reseller"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialActionParticipant" ADD CONSTRAINT "CommercialActionParticipant_employeeId_companyId_fkey" FOREIGN KEY ("employeeId", "companyId") REFERENCES "Employee"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialActionParticipant" ADD CONSTRAINT "CommercialActionParticipant_commercialActionId_companyId_fkey" FOREIGN KEY ("commercialActionId", "companyId") REFERENCES "CommercialAction"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialTrip" ADD CONSTRAINT "CommercialTrip_producerId_companyId_fkey" FOREIGN KEY ("producerId", "companyId") REFERENCES "Producer"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialTrip" ADD CONSTRAINT "CommercialTrip_responsibleId_companyId_fkey" FOREIGN KEY ("responsibleId", "companyId") REFERENCES "Employee"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialTripParticipant" ADD CONSTRAINT "CommercialTripParticipant_employeeId_companyId_fkey" FOREIGN KEY ("employeeId", "companyId") REFERENCES "Employee"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialTripParticipant" ADD CONSTRAINT "CommercialTripParticipant_commercialTripId_companyId_fkey" FOREIGN KEY ("commercialTripId", "companyId") REFERENCES "CommercialTrip"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductGroup" ADD CONSTRAINT "ProductGroup_productId_companyId_fkey" FOREIGN KEY ("productId", "companyId") REFERENCES "Product"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductGroup" ADD CONSTRAINT "ProductGroup_groupId_companyId_fkey" FOREIGN KEY ("groupId", "companyId") REFERENCES "Group"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_commercialTripId_companyId_fkey" FOREIGN KEY ("commercialTripId", "companyId") REFERENCES "CommercialTrip"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_productId_companyId_fkey" FOREIGN KEY ("productId", "companyId") REFERENCES "Product"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileCommercialAction" ADD CONSTRAINT "FileCommercialAction_fileId_companyId_fkey" FOREIGN KEY ("fileId", "companyId") REFERENCES "File"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileCommercialAction" ADD CONSTRAINT "FileCommercialAction_commercialActionId_companyId_fkey" FOREIGN KEY ("commercialActionId", "companyId") REFERENCES "CommercialAction"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileCommercialTrip" ADD CONSTRAINT "FileCommercialTrip_fileId_companyId_fkey" FOREIGN KEY ("fileId", "companyId") REFERENCES "File"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileCommercialTrip" ADD CONSTRAINT "FileCommercialTrip_commercialTripId_companyId_fkey" FOREIGN KEY ("commercialTripId", "companyId") REFERENCES "CommercialTrip"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileProduct" ADD CONSTRAINT "FileProduct_fileId_companyId_fkey" FOREIGN KEY ("fileId", "companyId") REFERENCES "File"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileProduct" ADD CONSTRAINT "FileProduct_productId_companyId_fkey" FOREIGN KEY ("productId", "companyId") REFERENCES "Product"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Unicidade só entre registros ativos (soft delete). O schema do Prisma não declara índice
-- parcial, então eles existem só aqui; o Prisma Migrate ignora esses índices nos próximos diffs.
CREATE UNIQUE INDEX "User_email_active_key" ON "User"("email") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "UserCompany_companyId_owner_key" ON "UserCompany"("companyId") WHERE "isOwner" AND "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Person_companyId_nationalId_active_key" ON "Person"("companyId", "nationalId") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Role_companyId_name_active_key" ON "Role"("companyId", "name") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Employee_personId_companyId_active_key" ON "Employee"("personId", "companyId") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Potential_companyId_name_active_key" ON "Potential"("companyId", "name") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Producer_personId_companyId_active_key" ON "Producer"("personId", "companyId") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Reseller_companyId_registrationNumber_active_key" ON "Reseller"("companyId", "registrationNumber") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Invitation_companyId_email_pending_key" ON "Invitation"("companyId", "email") WHERE "acceptedAt" IS NULL AND "deletedAt" IS NULL;

-- Catálogo de permissões checadas pelas rotas (src/shared/application/auth/permissions.ts).
-- Fica em migration, e não no seed, para existir em todos os ambientes (o seed não roda na main).
-- Uma permissão nova no código precisa de uma migration nova com o INSERT dela.
INSERT INTO "Permission" ("id", "name", "description") VALUES
  ('55b08a42-0e74-4d9b-b656-7ea805530a65', 'company.update', 'Editar os dados da empresa.'),
  ('1cdaeb6a-4dbc-414f-bbe8-228584e97afe', 'persons.read', 'Visualizar pessoas.'),
  ('56f6a9af-4439-4eba-983b-401e8bf0e481', 'persons.create', 'Cadastrar pessoas.'),
  ('8cfe72d9-c95f-47bd-a6f4-9ae1c8788809', 'persons.update', 'Editar pessoas.'),
  ('286bdc77-e82e-4224-8d2b-a895df15da1a', 'persons.delete', 'Excluir pessoas.'),
  ('449fa387-8208-41a7-87f4-d830cfd6345a', 'products.read', 'Visualizar produtos.'),
  ('9381e976-ad57-4606-9ea3-f0a137f61f7b', 'products.create', 'Cadastrar produtos.'),
  ('f4abcc0d-cf1a-40c1-89ee-482cf6b81bfd', 'products.update', 'Editar produtos.'),
  ('2e91f784-2ae9-423a-b04e-efc28ff1c6f1', 'products.delete', 'Excluir produtos.'),
  ('42f4c602-2ed0-4328-9340-9fc54765614c', 'roles.read', 'Visualizar cargos.'),
  ('4ec09781-6864-4106-850b-80620282e003', 'roles.create', 'Cadastrar cargos.'),
  ('bb8ed876-d76b-4013-83b5-84af62bb7371', 'roles.update', 'Editar cargos e as permissões deles.'),
  ('9a5cce4d-5a6c-48b1-b9d2-cbf07672f765', 'roles.delete', 'Excluir cargos.'),
  ('1d8223b1-0dcf-4934-b6ec-5842a38f0d34', 'members.read', 'Visualizar os membros da empresa.'),
  ('ebdef639-e63c-42af-b89d-0a4ca02cc601', 'members.update', 'Alterar cargos e status dos membros.'),
  ('c72c9884-716b-4cc6-bdd7-32c0b531c357', 'members.delete', 'Remover membros da empresa.'),
  ('8eb3c9b0-ba24-407f-b277-77a75da2be2d', 'invitations.read', 'Visualizar convites.'),
  ('a5f58d95-d106-49c2-a2d0-65a394441d99', 'invitations.create', 'Convidar usuários para a empresa.'),
  ('57b7654b-64fb-4e84-9d17-bcb16e27e953', 'invitations.delete', 'Cancelar convites.')
ON CONFLICT ("name") DO NOTHING;
