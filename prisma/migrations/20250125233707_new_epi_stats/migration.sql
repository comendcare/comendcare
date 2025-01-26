/*
  Warnings:

  - You are about to drop the column `numberOfIdentifiedPatients` on the `Condition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Condition" DROP COLUMN "numberOfIdentifiedPatients",
ADD COLUMN     "globalEstimatedPopulation" INTEGER,
ADD COLUMN     "nationalEstimatedPopulation" INTEGER,
ADD COLUMN     "numberOfPatientsEngaged" INTEGER;
