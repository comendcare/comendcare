/*
  Warnings:

  - Added the required column `occurredAt` to the `FeedItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeedItem" ADD COLUMN     "occurredAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RawIngestEvent" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
