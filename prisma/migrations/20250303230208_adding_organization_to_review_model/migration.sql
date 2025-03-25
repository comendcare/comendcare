/*
  Warnings:

  - A unique constraint covering the columns `[authorId,companyId,organizationId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Review_authorId_companyId_key";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_companyId_organizationId_key" ON "Review"("authorId", "companyId", "organizationId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
