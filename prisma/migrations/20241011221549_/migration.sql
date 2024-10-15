/*
  Warnings:

  - You are about to drop the column `nodes` on the `Milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "nodes",
ADD COLUMN     "notes" TEXT;
