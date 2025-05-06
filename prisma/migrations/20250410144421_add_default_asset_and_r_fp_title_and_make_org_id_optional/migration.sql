-- AlterTable
ALTER TABLE "Tool" ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'Untitled Tool';

-- AlterTable
ALTER TABLE "RFP" ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'Untitled RFP';
