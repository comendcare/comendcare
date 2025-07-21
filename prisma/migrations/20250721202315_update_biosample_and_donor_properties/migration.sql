/*
  Warnings:

  - You are about to drop the column `area` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `biosampleDiagnosis` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `caseId` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `classifier` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `clinicalData` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `clinicalTestResults` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `cnvAbnormal` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `cnvNormal` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `donorAgeAtExcision` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `er` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `ffpeTumorAvailable` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `frozenTumorAvailable` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `fusionPositive` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `fusionWildtype` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `hercepTest` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `hlaType` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `icf` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `irbLetter` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `mass` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `matchedPairId` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `mirroredPairId` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `pathology` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `plasmaAvailable` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `pmi` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `pr` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `premiumGroup` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `priceEUR` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `priceGBP` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `priceUSD` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `primaryTumorOrgan` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `productCode` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `repository` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `serology` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `serumAvailable` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `significantVariantPositive` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `significantVariantWildtype` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `specimenId` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `stage` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `stageGroup` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `subFormat` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `wholeBloodAvailable` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `yearOfExcision` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the column `ageAtLastMenstrualPeriod` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `alcoholDuration` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `alcoholStatus` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `causeOfDeath` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `cigarettesPerDay` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `conditionSeverity` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `drinksPerDay` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `menopausalStatus` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfLiveBirths` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfPregnancies` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `primaryDiagnosis` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `smokingStatus` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `yearOfDeath` on the `Donor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Biosample" DROP COLUMN "area",
DROP COLUMN "biosampleDiagnosis",
DROP COLUMN "caseId",
DROP COLUMN "classifier",
DROP COLUMN "clinicalData",
DROP COLUMN "clinicalTestResults",
DROP COLUMN "cnvAbnormal",
DROP COLUMN "cnvNormal",
DROP COLUMN "donorAgeAtExcision",
DROP COLUMN "er",
DROP COLUMN "ffpeTumorAvailable",
DROP COLUMN "format",
DROP COLUMN "frozenTumorAvailable",
DROP COLUMN "fusionPositive",
DROP COLUMN "fusionWildtype",
DROP COLUMN "hercepTest",
DROP COLUMN "hlaType",
DROP COLUMN "icf",
DROP COLUMN "irbLetter",
DROP COLUMN "mass",
DROP COLUMN "matchedPairId",
DROP COLUMN "mirroredPairId",
DROP COLUMN "pathology",
DROP COLUMN "plasmaAvailable",
DROP COLUMN "pmi",
DROP COLUMN "pr",
DROP COLUMN "premiumGroup",
DROP COLUMN "priceEUR",
DROP COLUMN "priceGBP",
DROP COLUMN "priceUSD",
DROP COLUMN "primaryTumorOrgan",
DROP COLUMN "productCode",
DROP COLUMN "repository",
DROP COLUMN "serology",
DROP COLUMN "serumAvailable",
DROP COLUMN "significantVariantPositive",
DROP COLUMN "significantVariantWildtype",
DROP COLUMN "specimenId",
DROP COLUMN "stage",
DROP COLUMN "stageGroup",
DROP COLUMN "subFormat",
DROP COLUMN "volume",
DROP COLUMN "wholeBloodAvailable",
DROP COLUMN "yearOfExcision",
ADD COLUMN     "ageAtCollection" INTEGER,
ADD COLUMN     "collectionDate" TIMESTAMP(3),
ADD COLUMN     "geneId" INTEGER,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceUnit" TEXT,
ADD COLUMN     "quantity" DOUBLE PRECISION,
ADD COLUMN     "quantityUnit" TEXT,
ADD COLUMN     "variant" TEXT;

-- AlterTable
ALTER TABLE "Donor" DROP COLUMN "ageAtLastMenstrualPeriod",
DROP COLUMN "alcoholDuration",
DROP COLUMN "alcoholStatus",
DROP COLUMN "causeOfDeath",
DROP COLUMN "cigarettesPerDay",
DROP COLUMN "conditionSeverity",
DROP COLUMN "drinksPerDay",
DROP COLUMN "menopausalStatus",
DROP COLUMN "numberOfLiveBirths",
DROP COLUMN "numberOfPregnancies",
DROP COLUMN "primaryDiagnosis",
DROP COLUMN "smokingStatus",
DROP COLUMN "yearOfDeath",
ADD COLUMN     "species" TEXT;

-- AlterTable
ALTER TABLE "Tool" ALTER COLUMN "title" SET DEFAULT 'Untitled Tool';

-- AddForeignKey
ALTER TABLE "Biosample" ADD CONSTRAINT "Biosample_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE SET NULL ON UPDATE CASCADE;
