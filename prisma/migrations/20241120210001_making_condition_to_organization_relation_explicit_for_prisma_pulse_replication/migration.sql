/*
  Warnings:

  - You are about to drop the `_ConditionToOrganization` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ConditionToOrganization" DROP CONSTRAINT "_ConditionToOrganization_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConditionToOrganization" DROP CONSTRAINT "_ConditionToOrganization_B_fkey";

-- DropTable
DROP TABLE "_ConditionToOrganization";

-- CreateTable
CREATE TABLE "ConditionToOrganization" (
    "conditionId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConditionToOrganization_pkey" PRIMARY KEY ("conditionId","organizationId")
);

-- AddForeignKey
ALTER TABLE "ConditionToOrganization" ADD CONSTRAINT "ConditionToOrganization_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionToOrganization" ADD CONSTRAINT "ConditionToOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
