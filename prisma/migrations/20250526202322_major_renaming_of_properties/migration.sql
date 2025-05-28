/*
  Warnings:

  - You are about to drop the column `RFPId` on the `ExternalAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `RFPId` on the `ExternalContact` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExternalAttachment" DROP CONSTRAINT "ExternalAttachment_RFPId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalContact" DROP CONSTRAINT "ExternalContact_RFPId_fkey";

-- AlterTable
ALTER TABLE "ExternalAttachment" DROP COLUMN "RFPId",
ADD COLUMN     "rfpId" TEXT;

-- AlterTable
ALTER TABLE "ExternalContact" DROP COLUMN "RFPId",
ADD COLUMN     "rfpId" TEXT;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;
