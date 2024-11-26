/*
  Warnings:

  - Made the column `organizationId` on table `Invitation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_organizationId_fkey";

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
