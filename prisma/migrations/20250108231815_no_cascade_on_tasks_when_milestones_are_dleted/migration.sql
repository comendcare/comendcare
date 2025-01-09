-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_milestoneId_fkey";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
