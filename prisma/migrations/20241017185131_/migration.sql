/*
  Warnings:

  - You are about to drop the column `deadline` on the `Milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "deadline",
ADD COLUMN     "timelineMonth" TEXT,
ADD COLUMN     "timelineYear" TEXT;
