-- CreateTable
CREATE TABLE "MilestoneToCompany" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "MilestoneToCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilestoneToInstitution" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "MilestoneToInstitution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MilestoneToCompany" ADD CONSTRAINT "MilestoneToCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneToCompany" ADD CONSTRAINT "MilestoneToCompany_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneToInstitution" ADD CONSTRAINT "MilestoneToInstitution_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneToInstitution" ADD CONSTRAINT "MilestoneToInstitution_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
