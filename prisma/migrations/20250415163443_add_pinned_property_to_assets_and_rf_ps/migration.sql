-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RFP" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;
