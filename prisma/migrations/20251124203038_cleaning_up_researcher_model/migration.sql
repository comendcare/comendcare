/*
  Warnings:

  - You are about to drop the column `email` on the `Researcher` table. All the data in the column will be lost.
  - You are about to drop the column `emailHash` on the `Researcher` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Researcher` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Researcher` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Researcher_emailHash_key";

-- DropIndex
DROP INDEX "Researcher_email_key";

-- AlterTable
ALTER TABLE "Researcher" DROP COLUMN "email",
DROP COLUMN "emailHash",
DROP COLUMN "name",
DROP COLUMN "role";
