/*
  Warnings:

  - You are about to drop the column `papers` on the `Milestone` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RFPOpenToType" AS ENUM ('CRO', 'ACADEMIC', 'ALL', 'NONE');

-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "papers",
ADD COLUMN     "RFPId" TEXT,
ADD COLUMN     "assetId" TEXT;

-- CreateTable
CREATE TABLE "RFP" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "funding" INTEGER NOT NULL,
    "description" TEXT,
    "researchFocus" "MilestoneType" NOT NULL DEFAULT 'NOTYPE',
    "openTo" "RFPOpenToType" NOT NULL DEFAULT 'ALL',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "RFP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalAttachments" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "link" TEXT NOT NULL,
    "rFPId" TEXT,
    "assetId" TEXT,
    "milestoneId" TEXT,

    CONSTRAINT "ExternalAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalContact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT NOT NULL,
    "rFPId" TEXT,
    "assetId" TEXT,

    CONSTRAINT "ExternalContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RFP_id_key" ON "RFP"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_id_key" ON "Asset"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalAttachments_id_key" ON "ExternalAttachments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalContact_id_key" ON "ExternalContact"("id");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_RFPId_fkey" FOREIGN KEY ("RFPId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachments" ADD CONSTRAINT "ExternalAttachments_rFPId_fkey" FOREIGN KEY ("rFPId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachments" ADD CONSTRAINT "ExternalAttachments_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachments" ADD CONSTRAINT "ExternalAttachments_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_rFPId_fkey" FOREIGN KEY ("rFPId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
