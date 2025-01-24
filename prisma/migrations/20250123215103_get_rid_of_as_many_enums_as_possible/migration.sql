/*
  Warnings:

  - The `status` column on the `Milestone` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `openTo` column on the `RFP` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `followedType` on the `Follow` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `mentionedType` on the `Mention` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Reaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `reactableType` on the `Reaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Follow" DROP COLUMN "followedType",
ADD COLUMN     "followedType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Mention" DROP COLUMN "mentionedType",
ADD COLUMN     "mentionedType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PLANNED';

-- AlterTable
ALTER TABLE "RFP" DROP COLUMN "openTo",
ADD COLUMN     "openTo" TEXT NOT NULL DEFAULT 'ALL';

-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "reactableType",
ADD COLUMN     "reactableType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "status",
ADD COLUMN     "status" TEXT DEFAULT 'PLANNED',
DROP COLUMN "priority",
ADD COLUMN     "priority" TEXT;

-- DropEnum
DROP TYPE "FollowedType";

-- DropEnum
DROP TYPE "MentionedType";

-- DropEnum
DROP TYPE "NodeType";

-- DropEnum
DROP TYPE "PriorityType";

-- DropEnum
DROP TYPE "RFPOpenToType";

-- DropEnum
DROP TYPE "ReactableType";

-- DropEnum
DROP TYPE "ReactionType";

-- DropEnum
DROP TYPE "StatusType";

-- CreateIndex
CREATE UNIQUE INDEX "Follow_userId_followedType_followedId_key" ON "Follow"("userId", "followedType", "followedId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_authorId_reactableType_reactableId_key" ON "Reaction"("authorId", "reactableType", "reactableId");
