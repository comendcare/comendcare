/*
  Warnings:

  - You are about to drop the column `postId` on the `Reaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authorId,reactableType,reactableId]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reactableId` to the `Reaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reactableType` to the `Reaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FollowedType" AS ENUM ('ORGANIZATION');

-- CreateEnum
CREATE TYPE "ReactableType" AS ENUM ('POST', 'COMMENT');

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_postId_fkey";

-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "postId",
ADD COLUMN     "reactableId" TEXT NOT NULL,
ADD COLUMN     "reactableType" "ReactableType" NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "followedType" "FollowedType" NOT NULL,
    "followedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Follow_userId_followedType_followedId_key" ON "Follow"("userId", "followedType", "followedId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_authorId_reactableType_reactableId_key" ON "Reaction"("authorId", "reactableType", "reactableId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
