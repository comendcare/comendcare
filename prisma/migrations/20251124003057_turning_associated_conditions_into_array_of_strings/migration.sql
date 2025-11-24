/*
  Warnings:

  - You are about to drop the column `isPrimary` on the `ConditionToOrganization` table. All the data in the column will be lost.
  - You are about to drop the `_AssociatedConditions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AssociatedConditions" DROP CONSTRAINT "_AssociatedConditions_A_fkey";

-- DropForeignKey
ALTER TABLE "_AssociatedConditions" DROP CONSTRAINT "_AssociatedConditions_B_fkey";

-- DropIndex
DROP INDEX "ConditionToOrganization_organizationId_isPrimary_idx";

-- AlterTable
ALTER TABLE "Condition" ADD COLUMN     "associatedConditions" TEXT[];

-- AlterTable
ALTER TABLE "ConditionToOrganization" DROP COLUMN "isPrimary";

-- DropTable
DROP TABLE "_AssociatedConditions";
