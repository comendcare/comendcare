-- DropForeignKey
ALTER TABLE "ExternalAttachment" DROP CONSTRAINT "ExternalAttachment_biosampleId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalAttachment" DROP CONSTRAINT "ExternalAttachment_diseaseModelId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalAttachment" DROP CONSTRAINT "ExternalAttachment_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalAttachment" DROP CONSTRAINT "ExternalAttachment_rfpId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalAttachment" DROP CONSTRAINT "ExternalAttachment_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalAttachment" DROP CONSTRAINT "ExternalAttachment_toolId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalContact" DROP CONSTRAINT "ExternalContact_biosampleId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalContact" DROP CONSTRAINT "ExternalContact_diseaseModelId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalContact" DROP CONSTRAINT "ExternalContact_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalContact" DROP CONSTRAINT "ExternalContact_rfpId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalContact" DROP CONSTRAINT "ExternalContact_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalContact" DROP CONSTRAINT "ExternalContact_toolId_fkey";

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_biosampleId_fkey" FOREIGN KEY ("biosampleId") REFERENCES "Biosample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_diseaseModelId_fkey" FOREIGN KEY ("diseaseModelId") REFERENCES "DiseaseModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_biosampleId_fkey" FOREIGN KEY ("biosampleId") REFERENCES "Biosample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_diseaseModelId_fkey" FOREIGN KEY ("diseaseModelId") REFERENCES "DiseaseModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
