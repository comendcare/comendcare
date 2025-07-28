/*
  Warnings:

  - You are about to drop the column `diagnoses` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the `BiosampleDiagnosis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BiosampleDiagnosis" DROP CONSTRAINT "BiosampleDiagnosis_biosampleId_fkey";

-- DropForeignKey
ALTER TABLE "BiosampleDiagnosis" DROP CONSTRAINT "BiosampleDiagnosis_typeId_fkey";

-- AlterTable
ALTER TABLE "Donor" DROP COLUMN "diagnoses";

-- DropTable
DROP TABLE "BiosampleDiagnosis";

-- CreateTable
CREATE TABLE "DonorDiagnosis" (
    "id" TEXT NOT NULL,
    "severity" TEXT,
    "donorId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,

    CONSTRAINT "DonorDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonorDiagnosis_id_key" ON "DonorDiagnosis"("id");

-- AddForeignKey
ALTER TABLE "DonorDiagnosis" ADD CONSTRAINT "DonorDiagnosis_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorDiagnosis" ADD CONSTRAINT "DonorDiagnosis_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "DiagnosisType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
