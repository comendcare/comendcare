-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('MILESTONE');

-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('TODO', 'INPROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tasks" TEXT[],
    "nodes" TEXT,
    "status" "StatusType" NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edge" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "type" TEXT,
    "data" JSONB,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Node_id_key" ON "Node"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_id_key" ON "Milestone"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_nodeId_key" ON "Milestone"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Edge_id_key" ON "Edge"("id");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
