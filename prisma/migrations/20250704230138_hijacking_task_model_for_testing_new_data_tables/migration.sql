/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('todo', 'in_progress', 'done', 'canceled');

-- CreateEnum
CREATE TYPE "Label" AS ENUM ('bug', 'feature', 'enhancement', 'documentation');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "code" VARCHAR(128) NOT NULL,
ADD COLUMN     "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "label" "Label" NOT NULL DEFAULT 'bug',
ADD COLUMN     "title" VARCHAR(128);

-- CreateIndex
CREATE UNIQUE INDEX "Task_code_key" ON "Task"("code");
