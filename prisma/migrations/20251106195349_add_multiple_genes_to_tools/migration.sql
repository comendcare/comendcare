-- AlterTable
ALTER TABLE "Biosample" ADD COLUMN     "genes" TEXT[];

-- AlterTable
ALTER TABLE "DiseaseModel" ADD COLUMN     "genes" TEXT[];

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "genes" TEXT[];
