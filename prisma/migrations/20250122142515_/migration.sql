/*
  Warnings:

  - The values [TODO,DONE] on the enum `StatusType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusType_new" AS ENUM ('PLANNED', 'INPROGRESS', 'COMPLETED');
ALTER TABLE "Milestone" ALTER COLUMN "status" TYPE "StatusType_new" USING ("status"::text::"StatusType_new");
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "StatusType_new" USING ("status"::text::"StatusType_new");
ALTER TYPE "StatusType" RENAME TO "StatusType_old";
ALTER TYPE "StatusType_new" RENAME TO "StatusType";
DROP TYPE "StatusType_old";
COMMIT;
