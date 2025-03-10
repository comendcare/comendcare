/*
  Warnings:

  - You are about to drop the column `biopharmaConsentSettings` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "biopharmaConsentSettings" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "biopharmaConsentSettings";
