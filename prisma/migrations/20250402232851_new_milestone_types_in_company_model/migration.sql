/*
  Warnings:

  - You are about to drop the column `engagement` on the `SavedCompany` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "milestoneTypes" TEXT[];

-- AlterTable
ALTER TABLE "SavedCompany" DROP COLUMN "engagement";
