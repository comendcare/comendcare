/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Milestone` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_organizationId_fkey";

-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "organizationId";
