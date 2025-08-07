-- CreateTable
CREATE TABLE "DiseaseModelToMilestone" (
    "id" TEXT NOT NULL,
    "diseaseModelId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "DiseaseModelToMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseModelToMilestone_diseaseModelId_milestoneId_key" ON "DiseaseModelToMilestone"("diseaseModelId", "milestoneId");

-- AddForeignKey
ALTER TABLE "DiseaseModelToMilestone" ADD CONSTRAINT "DiseaseModelToMilestone_diseaseModelId_fkey" FOREIGN KEY ("diseaseModelId") REFERENCES "DiseaseModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseModelToMilestone" ADD CONSTRAINT "DiseaseModelToMilestone_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
