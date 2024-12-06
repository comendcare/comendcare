/*
  Warnings:

  - You are about to drop the `ExternalAttachments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExternalAttachments" DROP CONSTRAINT "ExternalAttachments_assetId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalAttachments" DROP CONSTRAINT "ExternalAttachments_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalAttachments" DROP CONSTRAINT "ExternalAttachments_rFPId_fkey";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RFP" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "ExternalAttachments";

-- CreateTable
CREATE TABLE "ExternalAttachment" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "link" TEXT NOT NULL,
    "rFPId" TEXT,
    "assetId" TEXT,
    "milestoneId" TEXT,

    CONSTRAINT "ExternalAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalAttachment_id_key" ON "ExternalAttachment"("id");

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_rFPId_fkey" FOREIGN KEY ("rFPId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
