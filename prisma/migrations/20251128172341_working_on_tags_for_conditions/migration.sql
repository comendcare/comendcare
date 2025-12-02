-- CreateEnum
CREATE TYPE "TaggableType" AS ENUM ('CONDITION');

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagAssignment" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "taggableType" "TaggableType" NOT NULL,
    "taggableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "TagAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_normalizedValue_key" ON "Tag"("normalizedValue");

-- CreateIndex
CREATE INDEX "TagAssignment_taggableType_taggableId_idx" ON "TagAssignment"("taggableType", "taggableId");

-- CreateIndex
CREATE INDEX "TagAssignment_tagId_idx" ON "TagAssignment"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "TagAssignment_tagId_taggableType_taggableId_key" ON "TagAssignment"("tagId", "taggableType", "taggableId");

-- AddForeignKey
ALTER TABLE "TagAssignment" ADD CONSTRAINT "TagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
