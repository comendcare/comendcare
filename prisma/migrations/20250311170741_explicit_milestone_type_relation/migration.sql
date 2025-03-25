/*
  Warnings:

  - You are about to drop the `_MilestoneToMilestoneType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MilestoneToMilestoneType" DROP CONSTRAINT "_MilestoneToMilestoneType_A_fkey";

-- DropForeignKey
ALTER TABLE "_MilestoneToMilestoneType" DROP CONSTRAINT "_MilestoneToMilestoneType_B_fkey";

-- DropTable
DROP TABLE "_MilestoneToMilestoneType";

-- CreateTable
CREATE TABLE "MilestoneTypeOnMilestone" (
    "id" TEXT NOT NULL,
    "milestoneTypeId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MilestoneTypeOnMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MilestoneTypeOnMilestone_milestoneTypeId_milestoneId_key" ON "MilestoneTypeOnMilestone"("milestoneTypeId", "milestoneId");

-- AddForeignKey
ALTER TABLE "MilestoneTypeOnMilestone" ADD CONSTRAINT "MilestoneTypeOnMilestone_milestoneTypeId_fkey" FOREIGN KEY ("milestoneTypeId") REFERENCES "MilestoneType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneTypeOnMilestone" ADD CONSTRAINT "MilestoneTypeOnMilestone_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
