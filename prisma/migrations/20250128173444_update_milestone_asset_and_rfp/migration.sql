/*
  Warnings:

  - You are about to drop the column `rFPId` on the `ExternalAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `rFPId` on the `ExternalContact` table. All the data in the column will be lost.
  - You are about to drop the column `RFPId` on the `Milestone` table. All the data in the column will be lost.
  - You are about to drop the column `toolId` on the `Milestone` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExternalAttachment" DROP CONSTRAINT "ExternalAttachment_rFPId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalContact" DROP CONSTRAINT "ExternalContact_rFPId_fkey";

-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_RFPId_fkey";

-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_toolId_fkey";

-- AlterTable
ALTER TABLE "ExternalAttachment" DROP COLUMN "rFPId",
ADD COLUMN     "RFPId" TEXT;

-- AlterTable
ALTER TABLE "ExternalContact" DROP COLUMN "rFPId",
ADD COLUMN     "RFPId" TEXT,
ADD COLUMN     "milestoneId" TEXT;

-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "RFPId",
DROP COLUMN "toolId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "openTo" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_RFPId_fkey" FOREIGN KEY ("RFPId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_RFPId_fkey" FOREIGN KEY ("RFPId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
