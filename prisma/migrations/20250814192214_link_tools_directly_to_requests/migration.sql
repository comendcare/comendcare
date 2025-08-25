-- CreateTable
CREATE TABLE "MaterialAndDataAccessRequestToBiosample" (
    "id" TEXT NOT NULL,
    "materialAndDataAccessRequestId" TEXT NOT NULL,
    "biosampleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialAndDataAccessRequestToBiosample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialAndDataAccessRequestToDiseaseModel" (
    "id" TEXT NOT NULL,
    "materialAndDataAccessRequestId" TEXT NOT NULL,
    "diseaseModelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialAndDataAccessRequestToDiseaseModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialAndDataAccessRequestToTool" (
    "id" TEXT NOT NULL,
    "materialAndDataAccessRequestId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialAndDataAccessRequestToTool_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaterialAndDataAccessRequestToBiosample" ADD CONSTRAINT "MaterialAndDataAccessRequestToBiosample_materialAndDataAcc_fkey" FOREIGN KEY ("materialAndDataAccessRequestId") REFERENCES "MaterialAndDataAccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialAndDataAccessRequestToBiosample" ADD CONSTRAINT "MaterialAndDataAccessRequestToBiosample_biosampleId_fkey" FOREIGN KEY ("biosampleId") REFERENCES "Biosample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialAndDataAccessRequestToDiseaseModel" ADD CONSTRAINT "MaterialAndDataAccessRequestToDiseaseModel_materialAndData_fkey" FOREIGN KEY ("materialAndDataAccessRequestId") REFERENCES "MaterialAndDataAccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialAndDataAccessRequestToDiseaseModel" ADD CONSTRAINT "MaterialAndDataAccessRequestToDiseaseModel_diseaseModelId_fkey" FOREIGN KEY ("diseaseModelId") REFERENCES "DiseaseModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialAndDataAccessRequestToTool" ADD CONSTRAINT "MaterialAndDataAccessRequestToTool_materialAndDataAccessRe_fkey" FOREIGN KEY ("materialAndDataAccessRequestId") REFERENCES "MaterialAndDataAccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialAndDataAccessRequestToTool" ADD CONSTRAINT "MaterialAndDataAccessRequestToTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
