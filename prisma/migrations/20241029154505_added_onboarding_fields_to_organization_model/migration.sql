-- CreateEnum
CREATE TYPE "IncorporationStatus" AS ENUM ('yes', 'no', 'inProgress');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('yes', 'no', 'inProgress');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "assetsUnderDevelopment" TEXT[],
ADD COLUMN     "associatedGenes" TEXT[],
ADD COLUMN     "associatedSignsAndSymptoms" TEXT[],
ADD COLUMN     "dateFounded" TIMESTAMP(3),
ADD COLUMN     "diseaseCategories" TEXT[],
ADD COLUMN     "diseaseName" TEXT,
ADD COLUMN     "estimatedTotalPrevalence" INTEGER,
ADD COLUMN     "existingDatabasesAndStudies" TEXT[],
ADD COLUMN     "incorporationStatus" "IncorporationStatus",
ADD COLUMN     "interestedModalities" TEXT[],
ADD COLUMN     "moneyDeployed" INTEGER,
ADD COLUMN     "moneyRaised" INTEGER,
ADD COLUMN     "numberOfIdentifiedPatients" INTEGER,
ADD COLUMN     "relevantDiseaseMechanisms" TEXT[],
ADD COLUMN     "researchBudget" INTEGER,
ADD COLUMN     "statedGoal" "Goal",
ADD COLUMN     "website" TEXT;
