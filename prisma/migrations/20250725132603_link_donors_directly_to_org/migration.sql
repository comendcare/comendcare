/*
  Warnings:

  - You are about to drop the column `externalId` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `internalId` on the `Donor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Donor" DROP COLUMN "externalId",
DROP COLUMN "internalId",
ADD COLUMN     "organizationId" TEXT;

-- AddForeignKey
ALTER TABLE "Donor" ADD CONSTRAINT "Donor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
