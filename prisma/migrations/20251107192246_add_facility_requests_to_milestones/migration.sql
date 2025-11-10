-- AlterTable
ALTER TABLE "CreateFacilityRequest" ADD COLUMN     "milestoneId" TEXT;

-- AddForeignKey
ALTER TABLE "CreateFacilityRequest" ADD CONSTRAINT "CreateFacilityRequest_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
