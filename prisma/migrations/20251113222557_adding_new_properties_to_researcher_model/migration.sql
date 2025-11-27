-- AlterTable
ALTER TABLE "Researcher" ADD COLUMN     "country" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "therapeuticsOfInterests" TEXT[],
ADD COLUMN     "website" TEXT;
