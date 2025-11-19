-- AlterTable
ALTER TABLE "Researcher" ADD COLUMN     "country" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "therapeuticsOfInterest" TEXT[],
ADD COLUMN     "website" TEXT;
