-- CreateTable
CREATE TABLE "BiosampleDiagnosis" (
    "id" TEXT NOT NULL,
    "severity" TEXT,
    "biosampleId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,

    CONSTRAINT "BiosampleDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosisType" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "DiagnosisType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BiosampleDiagnosis_id_key" ON "BiosampleDiagnosis"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisType_id_key" ON "DiagnosisType"("id");

-- AddForeignKey
ALTER TABLE "BiosampleDiagnosis" ADD CONSTRAINT "BiosampleDiagnosis_biosampleId_fkey" FOREIGN KEY ("biosampleId") REFERENCES "Biosample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiosampleDiagnosis" ADD CONSTRAINT "BiosampleDiagnosis_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "DiagnosisType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
