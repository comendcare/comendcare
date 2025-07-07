/*
  Warnings:

  - You are about to drop the column `font` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "font";

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "rorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "established" INTEGER,
    "types" TEXT[],
    "aliases" TEXT[],
    "acronyms" TEXT[],
    "status" TEXT NOT NULL,
    "wikipediaUrl" TEXT,
    "website" TEXT,
    "city" TEXT,
    "countryName" TEXT,
    "countryCode" TEXT,
    "fundrefAll" TEXT[],
    "fundrefPreferred" TEXT,
    "gridAll" TEXT NOT NULL,
    "gridPreferred" TEXT,
    "isniAll" TEXT[],
    "wikidataAll" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionRelationship" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_rorId_key" ON "Institution"("rorId");

-- AddForeignKey
ALTER TABLE "InstitutionRelationship" ADD CONSTRAINT "InstitutionRelationship_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionRelationship" ADD CONSTRAINT "InstitutionRelationship_relatedId_fkey" FOREIGN KEY ("relatedId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
