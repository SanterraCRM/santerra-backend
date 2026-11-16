
ALTER TABLE "ProductRecommendation" DROP CONSTRAINT "ProductRecommendation_productId_companyId_fkey";

ALTER TABLE "ProductRecommendation" DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL;

CREATE UNIQUE INDEX "ProductRecommendation_commercialTripId_productId_key" ON "ProductRecommendation"("commercialTripId", "productId");
