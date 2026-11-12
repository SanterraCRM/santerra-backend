-- O schema passou a exigir updatedAt nestas tabelas; linhas antigas sem valor recebem o createdAt.
UPDATE "CommercialAction" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "CommercialTrip" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Group" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Harvest" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Manufacturer" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Product" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- AlterTable
ALTER TABLE "CommercialAction" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "CommercialTrip" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Harvest" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Manufacturer" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "updatedAt" SET NOT NULL;
