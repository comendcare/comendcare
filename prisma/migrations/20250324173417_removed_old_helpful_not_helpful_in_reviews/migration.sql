/*
  Warnings:

  - You are about to drop the column `helpfulCount` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `notHelpfulCount` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "helpfulCount",
DROP COLUMN "notHelpfulCount";
