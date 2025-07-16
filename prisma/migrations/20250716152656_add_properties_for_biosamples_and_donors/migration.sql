-- CreateTable
CREATE TABLE "Biosample" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anatomicalSite" TEXT,
    "pathology" TEXT,
    "preservationMethod" TEXT,
    "methodOfTransport" TEXT,
    "clinicalData" TEXT,
    "currentCountry" TEXT,
    "countryOfCollection" TEXT,
    "pmi" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "mass" DOUBLE PRECISION,
    "area" DOUBLE PRECISION,
    "repository" TEXT,
    "productCode" TEXT,
    "priceUSD" DOUBLE PRECISION,
    "priceGBP" DOUBLE PRECISION,
    "priceEUR" DOUBLE PRECISION,
    "premiumGroup" TEXT,
    "caseId" TEXT,
    "specimenId" TEXT,
    "format" TEXT,
    "subFormat" TEXT,
    "biosampleDiagnosis" TEXT,
    "significantVariantPositive" TEXT,
    "significantVariantWildtype" TEXT,
    "fusionPositive" TEXT,
    "fusionWildtype" TEXT,
    "cnvAbnormal" BOOLEAN,
    "cnvNormal" BOOLEAN,
    "hlaType" TEXT,
    "icf" TEXT,
    "irbLetter" TEXT,
    "yearOfExcision" INTEGER,
    "classifier" TEXT,
    "primaryTumorOrgan" TEXT,
    "stage" TEXT,
    "stageGroup" TEXT,
    "serology" TEXT,
    "clinicalTestResults" TEXT,
    "serumAvailable" BOOLEAN,
    "plasmaAvailable" BOOLEAN,
    "wholeBloodAvailable" BOOLEAN,
    "ffpeTumorAvailable" BOOLEAN,
    "frozenTumorAvailable" BOOLEAN,
    "er" TEXT,
    "pr" TEXT,
    "hercepTest" TEXT,
    "matchedPairId" TEXT,
    "mirroredPairId" TEXT,
    "donorAgeAtExcision" INTEGER,
    "toolId" TEXT NOT NULL,
    "institutionId" TEXT,
    "donorId" TEXT,

    CONSTRAINT "Biosample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "age" INTEGER,
    "sex" TEXT,
    "gender" TEXT,
    "race" TEXT,
    "ethnicity" TEXT,
    "treatments" TEXT[],
    "primaryDiagnosis" TEXT,
    "diagnoses" TEXT[],
    "yearOfDeath" INTEGER,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "menopausalStatus" BOOLEAN,
    "ageAtLastMenstrualPeriod" INTEGER,
    "numberOfPregnancies" INTEGER,
    "numberOfLiveBirths" INTEGER,
    "smokingStatus" BOOLEAN,
    "cigarettesPerDay" DOUBLE PRECISION,
    "alcoholStatus" BOOLEAN,
    "drinksPerDay" DOUBLE PRECISION,
    "alcoholDuration" DOUBLE PRECISION,
    "medications" TEXT[],
    "causeOfDeath" TEXT,
    "conditionSeverity" TEXT,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Biosample_id_key" ON "Biosample"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Biosample_toolId_key" ON "Biosample"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_id_key" ON "Donor"("id");

-- AddForeignKey
ALTER TABLE "Biosample" ADD CONSTRAINT "Biosample_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Biosample" ADD CONSTRAINT "Biosample_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Biosample" ADD CONSTRAINT "Biosample_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
