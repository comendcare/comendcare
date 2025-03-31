-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "role" SET DEFAULT 'member';

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "role" SET DEFAULT 'member';

-- AlterTable
ALTER TABLE "MemberRequest" ALTER COLUMN "role" SET DEFAULT 'member';
