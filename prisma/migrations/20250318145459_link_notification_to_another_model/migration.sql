/*
  Warnings:

  - Added the required column `targetId` to the `PlatformNotification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetType` to the `PlatformNotification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlatformNotification" ADD COLUMN     "targetId" TEXT NOT NULL,
ADD COLUMN     "targetType" TEXT NOT NULL;
