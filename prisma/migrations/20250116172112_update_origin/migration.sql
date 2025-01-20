/*
  Warnings:

  - You are about to drop the column `originX` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `originY` on the `Node` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Node" DROP COLUMN "originX",
DROP COLUMN "originY",
ADD COLUMN     "origin" DOUBLE PRECISION[] DEFAULT ARRAY[0.0, 0.0]::DOUBLE PRECISION[];
