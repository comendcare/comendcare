/*
  Warnings:

  - Added the required column `disseminationPlan` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasIrbApproval` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasRisks` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isCommercial` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `justification` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logisticsContact` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `needsCollectionMaterials` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openToCollab` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participantCompensation` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientSignificance` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providesCollectionKit` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyDescription` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyTitle` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeline` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MaterialAndDataAccessRequest" ADD COLUMN     "compensationDetails" TEXT,
ADD COLUMN     "disseminationPlan" TEXT NOT NULL,
ADD COLUMN     "fedexAccount" TEXT,
ADD COLUMN     "fundingOrganization" TEXT,
ADD COLUMN     "hasIrbApproval" BOOLEAN NOT NULL,
ADD COLUMN     "hasRisks" BOOLEAN NOT NULL,
ADD COLUMN     "irbStatus" TEXT,
ADD COLUMN     "isCommercial" BOOLEAN NOT NULL,
ADD COLUMN     "justification" TEXT NOT NULL,
ADD COLUMN     "logisticsContact" TEXT NOT NULL,
ADD COLUMN     "needsCollectionMaterials" BOOLEAN NOT NULL,
ADD COLUMN     "openToCollab" BOOLEAN NOT NULL,
ADD COLUMN     "otherSampleType" TEXT,
ADD COLUMN     "participantCompensation" BOOLEAN NOT NULL,
ADD COLUMN     "patientSignificance" TEXT NOT NULL,
ADD COLUMN     "processingRequirements" TEXT,
ADD COLUMN     "providesCollectionKit" BOOLEAN NOT NULL,
ADD COLUMN     "riskDescription" TEXT,
ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "shippingContact" TEXT,
ADD COLUMN     "shippingMethod" TEXT,
ADD COLUMN     "shippingPhone" TEXT,
ADD COLUMN     "studyDescription" TEXT NOT NULL,
ADD COLUMN     "studyTitle" TEXT NOT NULL,
ADD COLUMN     "timeline" TEXT NOT NULL;
