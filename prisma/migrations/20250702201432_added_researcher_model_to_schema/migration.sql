-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "InstitutionRelationship" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "Affiliation" (
    "id" TEXT NOT NULL,
    "researcherId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Researcher" (
    "id" TEXT NOT NULL,
    "orcid" TEXT NOT NULL,
    "email" TEXT,
    "emailHash" TEXT,
    "title" TEXT,
    "name" TEXT NOT NULL,
    "researchInterests" TEXT[],
    "conditionsOfInterest" TEXT[],
    "genesOfInterest" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Researcher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Affiliation_researcherId_institutionId_key" ON "Affiliation"("researcherId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_orcid_key" ON "Researcher"("orcid");

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_email_key" ON "Researcher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_emailHash_key" ON "Researcher"("emailHash");

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "Researcher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
