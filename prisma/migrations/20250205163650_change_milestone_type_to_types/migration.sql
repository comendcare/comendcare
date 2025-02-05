/*
  Warnings:

  - You are about to drop the column `type` on the `Milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "type",
ADD COLUMN     "types" TEXT[] DEFAULT ARRAY[]::TEXT[];
