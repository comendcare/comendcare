-- DropForeignKey
ALTER TABLE "Affiliation" DROP CONSTRAINT "Affiliation_researcherId_fkey";

-- CreateTable
CREATE TABLE "ClaimOrganizationInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailHash" TEXT,
    "role" VARCHAR NOT NULL DEFAULT 'owner',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,

    CONSTRAINT "ClaimOrganizationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClaimOrganizationInvitation_emailHash_organizationId_key" ON "ClaimOrganizationInvitation"("emailHash", "organizationId");

-- AddForeignKey
ALTER TABLE "ClaimOrganizationInvitation" ADD CONSTRAINT "ClaimOrganizationInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "Researcher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
