/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `columnId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Made the column `kanbanPosition` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orderPosition` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "columnId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "name" SET DEFAULT '',
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "milestoneId" DROP NOT NULL,
ALTER COLUMN "kanbanPosition" SET NOT NULL,
ALTER COLUMN "orderPosition" SET NOT NULL;

-- DropTable
DROP TABLE "Example";

-- CreateTable
CREATE TABLE "Kanban" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kanban_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Column" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Column',
    "kanbanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kanbanPosition" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kanban_organizationId_key" ON "Kanban"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Column_id_key" ON "Column"("id");

-- AddForeignKey
ALTER TABLE "Kanban" ADD CONSTRAINT "Kanban_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_kanbanId_fkey" FOREIGN KEY ("kanbanId") REFERENCES "Kanban"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;
