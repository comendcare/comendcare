-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "complete" BOOLEAN NOT NULL,
    "milestoneId" TEXT NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_id_key" ON "task"("id");

-- CreateIndex
CREATE UNIQUE INDEX "task_milestoneId_key" ON "task"("milestoneId");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
