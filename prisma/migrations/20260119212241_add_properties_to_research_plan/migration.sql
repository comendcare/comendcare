-- AlterTable
ALTER TABLE "ExternalAttachment" ADD COLUMN     "roadmapId" TEXT;

-- AlterTable
ALTER TABLE "ExternalContact" ADD COLUMN     "roadmapId" TEXT;

-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "stages" TEXT[],
ADD COLUMN     "statuses" TEXT[];

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;
