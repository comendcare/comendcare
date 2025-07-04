
-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "types" TEXT[];

-- CreateTable
CREATE TABLE "ToolType" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ToolType_pkey" PRIMARY KEY ("id")
);
