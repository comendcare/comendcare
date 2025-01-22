/*
  Warnings:

  - The `type` column on the `Milestone` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `researchFocus` column on the `RFP` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'NOTYPE';

-- AlterTable
ALTER TABLE "RFP" DROP COLUMN "researchFocus",
ADD COLUMN     "researchFocus" TEXT NOT NULL DEFAULT 'NOTYPE';

-- DropEnum
DROP TYPE "MilestoneType";
