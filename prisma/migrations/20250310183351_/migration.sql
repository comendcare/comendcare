/*
  Warnings:

  - You are about to drop the column `types` on the `Milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "types";

-- CreateTable
CREATE TABLE "MilestoneType" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "label" TEXT NOT NULL,
    "services" TEXT[],
    "category" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "MilestoneType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MilestoneToMilestoneType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MilestoneToMilestoneType_AB_unique" ON "_MilestoneToMilestoneType"("A", "B");

-- CreateIndex
CREATE INDEX "_MilestoneToMilestoneType_B_index" ON "_MilestoneToMilestoneType"("B");

-- AddForeignKey
ALTER TABLE "_MilestoneToMilestoneType" ADD CONSTRAINT "_MilestoneToMilestoneType_A_fkey" FOREIGN KEY ("A") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MilestoneToMilestoneType" ADD CONSTRAINT "_MilestoneToMilestoneType_B_fkey" FOREIGN KEY ("B") REFERENCES "MilestoneType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
