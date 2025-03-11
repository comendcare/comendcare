/*
  Warnings:

  - You are about to drop the column `category` on the `MilestoneType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "categories" TEXT[];

-- AlterTable
ALTER TABLE "MilestoneType" DROP COLUMN "category",
ADD COLUMN     "categories" TEXT[];
