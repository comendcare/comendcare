-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "otherTherapeuticsInDevelopment" TEXT,
ADD COLUMN     "otherTherapeuticsOfInterest" TEXT;

-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "otherModalities" TEXT;
