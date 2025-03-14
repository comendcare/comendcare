-- CreateEnum
CREATE TYPE "OrganizationToCompanyEngagement" AS ENUM ('EXPLORING', 'QUOTE', 'COLLABORATING', 'COLLABORATED');

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "timelineOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SavedCompany" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "engagement" "OrganizationToCompanyEngagement" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCompany_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedCompany_organizationId_companyId_key" ON "SavedCompany"("organizationId", "companyId");

-- AddForeignKey
ALTER TABLE "SavedCompany" ADD CONSTRAINT "SavedCompany_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCompany" ADD CONSTRAINT "SavedCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCompany" ADD CONSTRAINT "SavedCompany_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
