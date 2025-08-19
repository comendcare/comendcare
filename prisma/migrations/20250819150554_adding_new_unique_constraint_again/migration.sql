/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,id]` on the table `FeedItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "feed_createdAt_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "FeedItem_createdAt_id_key" ON "FeedItem"("createdAt", "id");
