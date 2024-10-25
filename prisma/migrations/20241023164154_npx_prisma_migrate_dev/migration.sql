-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "status" "StatusType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "milestoneId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "complete" BOOLEAN NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_key" ON "Task"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Task_milestoneId_key" ON "Task"("milestoneId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_id_key" ON "ChecklistItem"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_taskId_key" ON "ChecklistItem"("taskId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
