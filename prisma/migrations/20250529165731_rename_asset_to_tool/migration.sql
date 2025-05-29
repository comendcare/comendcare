/*
  Warnings:

  - You are about to drop the column `assetsUnderDevelopment` on the `Condition` table. All the data in the column will be lost.
  - You are about to drop the column `assetId` on the `ExternalAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `assetId` on the `ExternalContact` table. All the data in the column will be lost.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssetToMilestone` table. If the table is not empty, all the data it contains will be lost.

*/
-- -- DropForeignKey
-- ALTER TABLE "Asset" DROP CONSTRAINT "Asset_organizationId_fkey";

-- -- DropForeignKey
-- ALTER TABLE "AssetToMilestone" DROP CONSTRAINT "AssetToMilestone_assetId_fkey";

-- -- DropForeignKey
-- ALTER TABLE "AssetToMilestone" DROP CONSTRAINT "AssetToMilestone_milestoneId_fkey";

-- -- DropForeignKey
-- ALTER TABLE "ExternalAttachment" DROP CONSTRAINT "ExternalAttachment_assetId_fkey";

-- -- DropForeignKey
-- ALTER TABLE "ExternalContact" DROP CONSTRAINT "ExternalContact_assetId_fkey";

-- -- AlterTable
-- ALTER TABLE "Condition" DROP COLUMN "assetsUnderDevelopment",
-- ADD COLUMN     "toolsUnderDevelopment" TEXT[];

-- -- AlterTable
-- ALTER TABLE "ExternalAttachment" DROP COLUMN "assetId",
-- ADD COLUMN     "toolId" TEXT;

-- -- AlterTable
-- ALTER TABLE "ExternalContact" DROP COLUMN "assetId",
-- ADD COLUMN     "toolId" TEXT;

-- -- DropTable
-- DROP TABLE "Asset";

-- -- DropTable
-- DROP TABLE "AssetToMilestone";

-- -- CreateTable
-- CREATE TABLE "Tool" (
--     "id" TEXT NOT NULL,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "title" TEXT NOT NULL DEFAULT 'Untitled Asset',
--     "description" TEXT,
--     "private" BOOLEAN NOT NULL DEFAULT true,
--     "pinned" BOOLEAN NOT NULL DEFAULT false,
--     "metadata" JSONB,
--     "organizationId" TEXT,

--     CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "ToolToMilestone" (
--     "id" TEXT NOT NULL,
--     "toolId" TEXT NOT NULL,
--     "milestoneId" TEXT NOT NULL,
--     "metadata" JSONB,

--     CONSTRAINT "ToolToMilestone_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateIndex
-- CREATE UNIQUE INDEX "Tool_id_key" ON "Tool"("id");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "ToolToMilestone_toolId_milestoneId_key" ON "ToolToMilestone"("toolId", "milestoneId");

-- -- AddForeignKey
-- ALTER TABLE "Tool" ADD CONSTRAINT "Tool_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "ToolToMilestone" ADD CONSTRAINT "ToolToMilestone_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "ToolToMilestone" ADD CONSTRAINT "ToolToMilestone_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  CUSTOM SQL - to prevend data loss, change drop/create to rename
*/
-- Drop existing foreign keys to avoid reference issues
ALTER TABLE "AssetToMilestone" DROP CONSTRAINT IF EXISTS "AssetToMilestone_assetId_fkey";
ALTER TABLE "AssetToMilestone" DROP CONSTRAINT IF EXISTS "AssetToMilestone_milestoneId_fkey";
ALTER TABLE "Asset" DROP CONSTRAINT IF EXISTS "Asset_organizationId_fkey";
ALTER TABLE "ExternalAttachment" DROP CONSTRAINT IF EXISTS "ExternalAttachment_assetId_fkey";
ALTER TABLE "ExternalContact" DROP CONSTRAINT IF EXISTS "ExternalContact_assetId_fkey";

-- Rename tables
ALTER TABLE "Asset" RENAME TO "Tool";
ALTER TABLE "AssetToMilestone" RENAME TO "ToolToMilestone";

-- Rename columns
ALTER TABLE "Condition" RENAME COLUMN "assetsUnderDevelopment" TO "toolsUnderDevelopment";
ALTER TABLE "ExternalAttachment" RENAME COLUMN "assetId" TO "toolId";
ALTER TABLE "ExternalContact" RENAME COLUMN "assetId" TO "toolId";
ALTER TABLE "ToolToMilestone" RENAME COLUMN "assetId" TO "toolId";

-- Re-add foreign keys (now that tables/columns are in place)
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ToolToMilestone" ADD CONSTRAINT "ToolToMilestone_toolId_fkey"
    FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ToolToMilestone" ADD CONSTRAINT "ToolToMilestone_milestoneId_fkey"
    FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_toolId_fkey"
    FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_toolId_fkey"
    FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Optional: rename indexes
ALTER INDEX IF EXISTS "Asset_id_key" RENAME TO "Tool_id_key";
ALTER INDEX IF EXISTS "AssetToMilestone_assetId_milestoneId_key" RENAME TO "ToolToMilestone_toolId_milestoneId_key";
