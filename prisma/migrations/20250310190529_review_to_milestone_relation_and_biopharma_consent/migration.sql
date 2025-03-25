-- AlterTable
ALTER TABLE "User" ADD COLUMN     "biopharmaConsentSettings" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_MilestoneToReview" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MilestoneToReview_AB_unique" ON "_MilestoneToReview"("A", "B");

-- CreateIndex
CREATE INDEX "_MilestoneToReview_B_index" ON "_MilestoneToReview"("B");

-- AddForeignKey
ALTER TABLE "_MilestoneToReview" ADD CONSTRAINT "_MilestoneToReview_A_fkey" FOREIGN KEY ("A") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MilestoneToReview" ADD CONSTRAINT "_MilestoneToReview_B_fkey" FOREIGN KEY ("B") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
