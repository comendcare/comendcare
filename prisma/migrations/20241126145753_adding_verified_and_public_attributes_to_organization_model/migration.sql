-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
