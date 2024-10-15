/*
  Warnings:

  - You are about to drop the column `tasks` on the `Milestone` table. All the data in the column will be lost.
  - You are about to drop the `task` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_milestoneId_fkey";

-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "tasks";

-- DropTable
DROP TABLE "task";

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "complete" BOOLEAN NOT NULL,
    "milestoneId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_key" ON "Task"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Task_milestoneId_key" ON "Task"("milestoneId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
