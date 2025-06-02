/*
  Warnings:

  - A unique constraint covering the columns `[emailHash,organizationId]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Invitation_emailHash_key";

-- DropIndex
DROP INDEX "Invitation_email_organizationId_key";

-- DropIndex
DROP INDEX "MemberRequest_emailHash_key";

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_emailHash_organizationId_key" ON "Invitation"("emailHash", "organizationId");
