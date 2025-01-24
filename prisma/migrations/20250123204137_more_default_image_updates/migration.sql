/*
  Warnings:

  - You are about to drop the column `imageBlurhash` on the `Roadmap` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Roadmap" DROP COLUMN "imageBlurhash",
ALTER COLUMN "image" DROP DEFAULT;
