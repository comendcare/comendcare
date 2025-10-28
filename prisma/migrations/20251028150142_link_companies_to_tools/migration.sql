-- AlterTable
ALTER TABLE "Biosample" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "DiseaseModel" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseModel" ADD CONSTRAINT "DiseaseModel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Biosample" ADD CONSTRAINT "Biosample_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
