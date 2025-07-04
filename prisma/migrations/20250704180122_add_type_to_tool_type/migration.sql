/*
  Warnings:

  - Added the required column `type` to the `ToolType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ToolType" ADD COLUMN     "type" TEXT NOT NULL;
