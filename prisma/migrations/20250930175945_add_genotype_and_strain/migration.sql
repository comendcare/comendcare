-- AlterTable
ALTER TABLE "Biosample" ADD COLUMN     "genotype" TEXT;

-- AlterTable
ALTER TABLE "DiseaseModel" ADD COLUMN     "genotype" TEXT,
ADD COLUMN     "strain" TEXT;
