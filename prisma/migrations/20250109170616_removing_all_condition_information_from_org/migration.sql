/*
  Warnings:

  - You are about to drop the column `assetsUnderDevelopment` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `associatedGenes` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `associatedSignsAndSymptoms` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `diseaseCategories` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `diseaseName` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `existingDatabasesAndStudies` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `interestedModalities` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfIdentifiedPatients` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `prevalenceDenominator` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `prevalenceNumerator` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `prevalenceRatio` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `relevantDiseaseMechanisms` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "assetsUnderDevelopment",
DROP COLUMN "associatedGenes",
DROP COLUMN "associatedSignsAndSymptoms",
DROP COLUMN "diseaseCategories",
DROP COLUMN "diseaseName",
DROP COLUMN "existingDatabasesAndStudies",
DROP COLUMN "interestedModalities",
DROP COLUMN "numberOfIdentifiedPatients",
DROP COLUMN "prevalenceDenominator",
DROP COLUMN "prevalenceNumerator",
DROP COLUMN "prevalenceRatio",
DROP COLUMN "relevantDiseaseMechanisms";
