/*
  Warnings:

  - You are about to drop the column `reviewId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authorId,companyId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewId_fkey";

-- DropIndex
DROP INDEX "Review_authorId_reviewId_key";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "reviewId",
ADD COLUMN     "companyId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_companyId_key" ON "Review"("authorId", "companyId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
