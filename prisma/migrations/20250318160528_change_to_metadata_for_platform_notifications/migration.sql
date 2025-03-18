/*
  Warnings:

  - You are about to drop the column `targetId` on the `PlatformNotification` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `PlatformNotification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlatformNotification" DROP COLUMN "targetId",
DROP COLUMN "targetType",
ADD COLUMN     "metadata" JSONB;
