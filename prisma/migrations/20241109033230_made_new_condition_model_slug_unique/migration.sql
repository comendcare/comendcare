/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Condition` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Condition" ADD COLUMN     "gardURL" TEXT,
ADD COLUMN     "nordURL" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Condition_slug_key" ON "Condition"("slug");
