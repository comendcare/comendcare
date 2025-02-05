/*
  Warnings:

  - The `type` column on the `Milestone` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "type",
ADD COLUMN     "type" TEXT[] DEFAULT ARRAY['NOTYPE']::TEXT[];
