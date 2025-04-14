/*
  Warnings:

  - You are about to drop the column `interestedModalities` on the `Condition` table. All the data in the column will be lost.
  - You are about to drop the column `therapeuticsInDevelopment` on the `Condition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Condition" DROP COLUMN "interestedModalities",
DROP COLUMN "therapeuticsInDevelopment";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "therapeuticsInDevelopment" TEXT[],
ADD COLUMN     "therapeuticsOfInterest" TEXT[];
