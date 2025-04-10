-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'Untitled Asset';

-- AlterTable
ALTER TABLE "RFP" ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'Untitled RFP';
