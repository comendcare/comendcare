/*
  Warnings:

  - You are about to drop the column `toolId` on the `Biosample` table. All the data in the column will be lost.
  - You are about to drop the `ToolType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Biosample" DROP CONSTRAINT "Biosample_toolId_fkey";

-- DropIndex
DROP INDEX "Biosample_toolId_key";

-- AlterTable
ALTER TABLE "Biosample" DROP COLUMN "toolId",
ADD COLUMN     "availability" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "types" TEXT[];

-- AlterTable
ALTER TABLE "ExternalAttachment" ADD COLUMN     "biosampleId" TEXT;

-- AlterTable
ALTER TABLE "ExternalContact" ADD COLUMN     "biosampleId" TEXT;

-- DropTable
DROP TABLE "ToolType";

-- CreateTable
CREATE TABLE "BiosampleToMilestone" (
    "id" TEXT NOT NULL,
    "biosampleId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "BiosampleToMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BiosampleToMilestone_biosampleId_milestoneId_key" ON "BiosampleToMilestone"("biosampleId", "milestoneId");

-- AddForeignKey
ALTER TABLE "Biosample" ADD CONSTRAINT "Biosample_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiosampleToMilestone" ADD CONSTRAINT "BiosampleToMilestone_biosampleId_fkey" FOREIGN KEY ("biosampleId") REFERENCES "Biosample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiosampleToMilestone" ADD CONSTRAINT "BiosampleToMilestone_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_biosampleId_fkey" FOREIGN KEY ("biosampleId") REFERENCES "Biosample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_biosampleId_fkey" FOREIGN KEY ("biosampleId") REFERENCES "Biosample"("id") ON DELETE SET NULL ON UPDATE CASCADE;
