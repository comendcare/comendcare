/*
  Warnings:

  - Made the column `toolId` on table `AssetToMilestone` required. This step will fail if there are existing NULL values in that column.
  - Made the column `milestoneId` on table `AssetToMilestone` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rfpId` on table `RFPToMilestone` required. This step will fail if there are existing NULL values in that column.
  - Made the column `milestoneId` on table `RFPToMilestone` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AssetToMilestone" ALTER COLUMN "toolId" SET NOT NULL,
ALTER COLUMN "milestoneId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RFPToMilestone" ALTER COLUMN "rfpId" SET NOT NULL,
ALTER COLUMN "milestoneId" SET NOT NULL;
