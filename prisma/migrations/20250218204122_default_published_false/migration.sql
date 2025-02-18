-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "role" SET DEFAULT 'admin';

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "role" SET DEFAULT 'admin',
ALTER COLUMN "role" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "MemberRequest" ALTER COLUMN "role" SET DEFAULT 'admin';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;
