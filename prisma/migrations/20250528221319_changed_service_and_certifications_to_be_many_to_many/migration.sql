/*
  Warnings:

  - You are about to drop the column `companyId` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Certification" DROP CONSTRAINT "Certification_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_companyId_fkey";

-- AlterTable
ALTER TABLE "Certification" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "companyId";

-- CreateTable
CREATE TABLE "_CompanyToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CertificationToCompany" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyToService_AB_unique" ON "_CompanyToService"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyToService_B_index" ON "_CompanyToService"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CertificationToCompany_AB_unique" ON "_CertificationToCompany"("A", "B");

-- CreateIndex
CREATE INDEX "_CertificationToCompany_B_index" ON "_CertificationToCompany"("B");

-- AddForeignKey
ALTER TABLE "_CompanyToService" ADD CONSTRAINT "_CompanyToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToService" ADD CONSTRAINT "_CompanyToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CertificationToCompany" ADD CONSTRAINT "_CertificationToCompany_A_fkey" FOREIGN KEY ("A") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CertificationToCompany" ADD CONSTRAINT "_CertificationToCompany_B_fkey" FOREIGN KEY ("B") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
