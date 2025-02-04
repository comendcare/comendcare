/*
  Warnings:

  - The `openTo` column on the `Milestone` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `openTo` column on the `RFP` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "openTo",
ADD COLUMN     "openTo" TEXT[];

-- AlterTable
ALTER TABLE "RFP" DROP COLUMN "openTo",
ADD COLUMN     "openTo" TEXT[];
