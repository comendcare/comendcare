/*
  Warnings:

  - You are about to drop the column `availableBiomarkerTypes` on the `Condition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Condition" DROP COLUMN "availableBiomarkerTypes";

-- CreateTable
CREATE TABLE "Biomarker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,

    CONSTRAINT "Biomarker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Biomarker_conditionId_idx" ON "Biomarker"("conditionId");

-- AddForeignKey
ALTER TABLE "Biomarker" ADD CONSTRAINT "Biomarker_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
