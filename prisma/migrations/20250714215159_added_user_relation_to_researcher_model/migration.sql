/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Researcher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Researcher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Researcher" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_userId_key" ON "Researcher"("userId");

-- AddForeignKey
ALTER TABLE "Researcher" ADD CONSTRAINT "Researcher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
