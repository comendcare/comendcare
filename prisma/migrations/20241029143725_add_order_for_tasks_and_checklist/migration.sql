-- AlterTable
ALTER TABLE "ChecklistItem" ADD COLUMN     "orderPosition" INTEGER;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "kanbanPosition" INTEGER,
ADD COLUMN     "orderPosition" INTEGER;
