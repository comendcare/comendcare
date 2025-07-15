/*
  Warnings:

  - Added the required column `sampleCount` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submittedAt` to the `MaterialAndDataAccessRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MaterialAndDataAccessRequest" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "dataTypes" TEXT[],
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "sampleCount" INTEGER NOT NULL,
ADD COLUMN     "sampleTypes" TEXT[],
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "InstitutionToRequest" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "InstitutionToRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionToRequest_institutionId_requestId_key" ON "InstitutionToRequest"("institutionId", "requestId");

-- AddForeignKey
ALTER TABLE "InstitutionToRequest" ADD CONSTRAINT "InstitutionToRequest_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionToRequest" ADD CONSTRAINT "InstitutionToRequest_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MaterialAndDataAccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
