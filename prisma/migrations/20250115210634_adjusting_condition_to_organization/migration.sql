/*
  Warnings:

  - The primary key for the `ConditionToOrganization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `ConditionToOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ConditionToOrganization` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[conditionId,organizationId]` on the table `ConditionToOrganization` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `ConditionToOrganization` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "ConditionToOrganization" DROP CONSTRAINT "ConditionToOrganization_conditionId_fkey";

-- DropForeignKey
ALTER TABLE "ConditionToOrganization" DROP CONSTRAINT "ConditionToOrganization_organizationId_fkey";

-- AlterTable
ALTER TABLE "ConditionToOrganization" DROP CONSTRAINT "ConditionToOrganization_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "conditionId" DROP NOT NULL,
ALTER COLUMN "organizationId" DROP NOT NULL,
ADD CONSTRAINT "ConditionToOrganization_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ConditionToOrganization_conditionId_organizationId_key" ON "ConditionToOrganization"("conditionId", "organizationId");

-- AddForeignKey
ALTER TABLE "ConditionToOrganization" ADD CONSTRAINT "ConditionToOrganization_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionToOrganization" ADD CONSTRAINT "ConditionToOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
