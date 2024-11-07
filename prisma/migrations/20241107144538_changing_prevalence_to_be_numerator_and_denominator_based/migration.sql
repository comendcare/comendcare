/*
  Warnings:

  - You are about to drop the column `estimatedTotalPrevalence` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "estimatedTotalPrevalence",
ADD COLUMN     "prevalenceDenominator" INTEGER,
ADD COLUMN     "prevalenceNumerator" INTEGER;
