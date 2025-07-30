-- AlterTable
ALTER TABLE "ExternalAttachment" ADD COLUMN     "diseaseModelId" TEXT;

-- AlterTable
ALTER TABLE "ExternalContact" ADD COLUMN     "diseaseModelId" TEXT;

-- CreateTable
CREATE TABLE "DiseaseModel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "private" BOOLEAN NOT NULL DEFAULT true,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "types" TEXT[],
    "institutionId" TEXT,
    "geneId" INTEGER,
    "conditionId" TEXT,
    "organizationId" TEXT,

    CONSTRAINT "DiseaseModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseModel_id_key" ON "DiseaseModel"("id");

-- AddForeignKey
ALTER TABLE "DiseaseModel" ADD CONSTRAINT "DiseaseModel_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseModel" ADD CONSTRAINT "DiseaseModel_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseModel" ADD CONSTRAINT "DiseaseModel_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseModel" ADD CONSTRAINT "DiseaseModel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_diseaseModelId_fkey" FOREIGN KEY ("diseaseModelId") REFERENCES "DiseaseModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_diseaseModelId_fkey" FOREIGN KEY ("diseaseModelId") REFERENCES "DiseaseModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
