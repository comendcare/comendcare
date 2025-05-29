-- AlterTable
ALTER TABLE "Tool" RENAME CONSTRAINT "Asset_pkey" TO "Tool_pkey";

-- AlterTable
ALTER TABLE "ToolToMilestone" RENAME CONSTRAINT "AssetToMilestone_pkey" TO "ToolToMilestone_pkey";
