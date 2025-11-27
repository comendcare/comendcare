/*
  Warnings:

  - You are about to drop the column `therapeuticsOfInterests` on the `Researcher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Researcher" DROP COLUMN "therapeuticsOfInterests",
ADD COLUMN     "therapeuticsOfInterest" TEXT[];
