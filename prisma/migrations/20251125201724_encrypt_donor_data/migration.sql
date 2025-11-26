-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "ethnicityHash" TEXT,
ADD COLUMN     "genderHash" TEXT,
ADD COLUMN     "internalIdHash" TEXT,
ADD COLUMN     "raceHash" TEXT,
ADD COLUMN     "sexHash" TEXT,
ADD COLUMN     "speciesHash" TEXT;
