/*
  Warnings:

  - You are about to drop the column `dateFounded` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "dateFounded",
ADD COLUMN     "yearFounded" TEXT;
