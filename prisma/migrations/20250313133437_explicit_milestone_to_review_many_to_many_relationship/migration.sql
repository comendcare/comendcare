/*
  Warnings:

  - You are about to drop the `_MilestoneToReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MilestoneToReview" DROP CONSTRAINT "_MilestoneToReview_A_fkey";

-- DropForeignKey
ALTER TABLE "_MilestoneToReview" DROP CONSTRAINT "_MilestoneToReview_B_fkey";

-- DropTable
DROP TABLE "_MilestoneToReview";

-- CreateTable
CREATE TABLE "MilestoneToReview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "milestoneId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,

    CONSTRAINT "MilestoneToReview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MilestoneToReview" ADD CONSTRAINT "MilestoneToReview_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneToReview" ADD CONSTRAINT "MilestoneToReview_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
