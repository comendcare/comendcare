-- AlterTable
ALTER TABLE "ConditionToOrganization" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ConditionToOrganization_organizationId_isPrimary_idx" ON "ConditionToOrganization"("organizationId", "isPrimary");
