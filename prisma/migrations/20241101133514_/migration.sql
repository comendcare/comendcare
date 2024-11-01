/*
  Warnings:

  - The values [read,write,root] on the enum `ClientType` will be removed. If these variants are still used in the database, this will fail.
  - The values [yes,no,inProgress] on the enum `Goal` will be removed. If these variants are still used in the database, this will fail.
  - The values [yes,no,inProgress] on the enum `IncorporationStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `organizationId` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClientType_new" AS ENUM ('READ', 'WRITE', 'ROOT');
ALTER TABLE "Client" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Client" ALTER COLUMN "type" TYPE "ClientType_new" USING ("type"::text::"ClientType_new");
ALTER TYPE "ClientType" RENAME TO "ClientType_old";
ALTER TYPE "ClientType_new" RENAME TO "ClientType";
DROP TYPE "ClientType_old";
ALTER TABLE "Client" ALTER COLUMN "type" SET DEFAULT 'WRITE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Goal_new" AS ENUM ('YES', 'NO', 'INPROGRESS');
ALTER TABLE "Organization" ALTER COLUMN "statedGoal" TYPE "Goal_new" USING ("statedGoal"::text::"Goal_new");
ALTER TYPE "Goal" RENAME TO "Goal_old";
ALTER TYPE "Goal_new" RENAME TO "Goal";
DROP TYPE "Goal_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "IncorporationStatus_new" AS ENUM ('YES', 'NO', 'INPROGRESS');
ALTER TABLE "Organization" ALTER COLUMN "incorporationStatus" TYPE "IncorporationStatus_new" USING ("incorporationStatus"::text::"IncorporationStatus_new");
ALTER TYPE "IncorporationStatus" RENAME TO "IncorporationStatus_old";
ALTER TYPE "IncorporationStatus_new" RENAME TO "IncorporationStatus";
DROP TYPE "IncorporationStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_organizationId_fkey";

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "type" SET DEFAULT 'WRITE';

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
