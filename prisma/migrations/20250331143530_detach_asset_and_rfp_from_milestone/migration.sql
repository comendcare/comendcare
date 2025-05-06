/*
  Warnings:

  - You are about to drop the column `name` on the `Tool` table. All the data in the column will be lost.
  - You are about to drop the column `funding` on the `RFP` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `RFP` table. All the data in the column will be lost.
  - You are about to drop the column `researchFocus` on the `RFP` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `Tool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Tool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `RFP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `RFP` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tool" DROP COLUMN "name",
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RFP" DROP COLUMN "funding",
DROP COLUMN "name",
DROP COLUMN "researchFocus",
ADD COLUMN     "budget" INTEGER,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ToolToMilestone" (
    "id" TEXT NOT NULL,
    "toolId" TEXT,
    "milestoneId" TEXT,

    CONSTRAINT "ToolToMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFPToMilestone" (
    "id" TEXT NOT NULL,
    "rfpId" TEXT,
    "milestoneId" TEXT,

    CONSTRAINT "RFPToMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ToolToMilestone_toolId_milestoneId_key" ON "ToolToMilestone"("toolId", "milestoneId");

-- CreateIndex
CREATE UNIQUE INDEX "RFPToMilestone_rfpId_milestoneId_key" ON "RFPToMilestone"("rfpId", "milestoneId");

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolToMilestone" ADD CONSTRAINT "ToolToMilestone_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolToMilestone" ADD CONSTRAINT "ToolToMilestone_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFP" ADD CONSTRAINT "RFP_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPToMilestone" ADD CONSTRAINT "RFPToMilestone_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPToMilestone" ADD CONSTRAINT "RFPToMilestone_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
