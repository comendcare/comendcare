-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "cohortSize" INTEGER,
ADD COLUMN     "geneId" INTEGER,
ADD COLUMN     "institutionId" TEXT;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE SET NULL ON UPDATE CASCADE;
