-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "interestedModalities" TEXT[],
    "diseaseCategories" TEXT[],
    "prevalenceNumerator" INTEGER,
    "prevalenceDenominator" INTEGER,
    "numberOfIdentifiedPatients" INTEGER,
    "relevantDiseaseMechanisms" TEXT[],
    "associatedGenes" TEXT[],
    "associatedSignsAndSymptoms" TEXT[],
    "existingDatabasesAndStudies" TEXT[],
    "assetsUnderDevelopment" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConditionToOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ConditionToOrganization_AB_unique" ON "_ConditionToOrganization"("A", "B");

-- CreateIndex
CREATE INDEX "_ConditionToOrganization_B_index" ON "_ConditionToOrganization"("B");

-- AddForeignKey
ALTER TABLE "_ConditionToOrganization" ADD CONSTRAINT "_ConditionToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConditionToOrganization" ADD CONSTRAINT "_ConditionToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
