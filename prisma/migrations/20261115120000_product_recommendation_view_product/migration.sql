
ALTER TABLE "ProductRecommendation" DROP CONSTRAINT "ProductRecommendation_productId_companyId_fkey";

ALTER TABLE "ProductRecommendation" DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL;

CREATE UNIQUE INDEX "ProductRecommendation_commercialTripId_productId_key" ON "ProductRecommendation"("commercialTripId", "productId");


ALTER TABLE "CommercialActionResellerGuest" DROP CONSTRAINT "CommercialActionResellerGuest_resellerId_companyId_fkey";

ALTER TABLE "CommercialActionResellerGuest" DROP COLUMN "resellerId",
ADD COLUMN     "resellerId" INTEGER NOT NULL;

CREATE INDEX "CommercialActionResellerGuest_resellerId_idx" ON "CommercialActionResellerGuest"("resellerId");

CREATE UNIQUE INDEX "CommercialActionResellerGuest_commercialActionId_resellerId_key" ON "CommercialActionResellerGuest"("commercialActionId", "resellerId");
