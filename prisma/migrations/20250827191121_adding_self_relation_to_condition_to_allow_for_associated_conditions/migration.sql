/*
  Warnings:

  - Made the column `rorId` on table `Institution` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `Institution` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gridAll` on table `Institution` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Institution" ALTER COLUMN "rorId" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "gridAll" SET NOT NULL;

-- CreateTable
CREATE TABLE "_AssociatedConditions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AssociatedConditions_AB_unique" ON "_AssociatedConditions"("A", "B");

-- CreateIndex
CREATE INDEX "_AssociatedConditions_B_index" ON "_AssociatedConditions"("B");

-- AddForeignKey
ALTER TABLE "_AssociatedConditions" ADD CONSTRAINT "_AssociatedConditions_A_fkey" FOREIGN KEY ("A") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssociatedConditions" ADD CONSTRAINT "_AssociatedConditions_B_fkey" FOREIGN KEY ("B") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
