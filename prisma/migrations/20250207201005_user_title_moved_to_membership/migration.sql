/*
  Warnings:

  - You are about to drop the column `accepted` on the `MemberRequest` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `User` table. All the data in the column will be lost.
  - Added the required column `title` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MemberRequest" DROP COLUMN "accepted";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "title";
