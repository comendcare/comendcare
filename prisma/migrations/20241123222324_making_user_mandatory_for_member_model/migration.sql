/*
  Warnings:

  - Made the column `userId` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_userId_fkey";

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
