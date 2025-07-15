/*
  Warnings:

  - You are about to drop the column `postId` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `materialAndDataAccessRequestId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "postId",
ADD COLUMN     "materialAndDataAccessRequestId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_materialAndDataAccessRequestId_fkey" FOREIGN KEY ("materialAndDataAccessRequestId") REFERENCES "MaterialAndDataAccessRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
