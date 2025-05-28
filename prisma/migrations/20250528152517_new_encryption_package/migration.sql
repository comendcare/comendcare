/*
  Warnings:

  - A unique constraint covering the columns `[emailHash]` on the table `ExternalContact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailHash]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailHash]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailHash]` on the table `MemberRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailHash]` on the table `Whitelist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ExternalContact" ADD COLUMN     "emailHash" TEXT;

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "emailHash" TEXT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "emailHash" TEXT;

-- AlterTable
ALTER TABLE "MemberRequest" ADD COLUMN     "emailHash" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailHash" TEXT;

-- AlterTable
ALTER TABLE "Whitelist" ADD COLUMN     "emailHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ExternalContact_emailHash_key" ON "ExternalContact"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_emailHash_key" ON "Invitation"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "Member_emailHash_key" ON "Member"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "MemberRequest_emailHash_key" ON "MemberRequest"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailHash_key" ON "User"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "Whitelist_emailHash_key" ON "Whitelist"("emailHash");
