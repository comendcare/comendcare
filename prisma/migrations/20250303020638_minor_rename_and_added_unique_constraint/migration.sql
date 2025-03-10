/*
  Warnings:

  - You are about to drop the column `resourceId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authorId,reviewId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reviewId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_resourceId_fkey";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "resourceId",
ADD COLUMN     "reviewId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_reviewId_key" ON "Review"("authorId", "reviewId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
