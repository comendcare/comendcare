/*
  Warnings:

  - You are about to drop the column `services` on the `MilestoneType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MilestoneType" DROP COLUMN "services";

-- CreateTable
CREATE TABLE "_MilestoneTypeToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MilestoneTypeToService_AB_unique" ON "_MilestoneTypeToService"("A", "B");

-- CreateIndex
CREATE INDEX "_MilestoneTypeToService_B_index" ON "_MilestoneTypeToService"("B");

-- AddForeignKey
ALTER TABLE "_MilestoneTypeToService" ADD CONSTRAINT "_MilestoneTypeToService_A_fkey" FOREIGN KEY ("A") REFERENCES "MilestoneType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MilestoneTypeToService" ADD CONSTRAINT "_MilestoneTypeToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
