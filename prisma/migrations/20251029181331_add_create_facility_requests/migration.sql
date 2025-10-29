-- CreateTable
CREATE TABLE "CreateFacilityRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "biosampleId" TEXT,
    "diseaseModelId" TEXT,
    "clinicalDatasetId" TEXT,

    CONSTRAINT "CreateFacilityRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CreateFacilityRequest" ADD CONSTRAINT "CreateFacilityRequest_biosampleId_fkey" FOREIGN KEY ("biosampleId") REFERENCES "Biosample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreateFacilityRequest" ADD CONSTRAINT "CreateFacilityRequest_diseaseModelId_fkey" FOREIGN KEY ("diseaseModelId") REFERENCES "DiseaseModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreateFacilityRequest" ADD CONSTRAINT "CreateFacilityRequest_clinicalDatasetId_fkey" FOREIGN KEY ("clinicalDatasetId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
