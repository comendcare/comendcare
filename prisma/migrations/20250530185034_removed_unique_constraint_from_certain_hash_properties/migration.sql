/*
  Warnings:

  - A unique constraint covering the columns `[contactEmail]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ExternalContact_nameHash_key";

-- DropIndex
DROP INDEX "User_address1Hash_key";

-- DropIndex
DROP INDEX "User_address2Hash_key";

-- DropIndex
DROP INDEX "User_cityHash_key";

-- DropIndex
DROP INDEX "User_countryHash_key";

-- DropIndex
DROP INDEX "User_formattedAddressHash_key";

-- DropIndex
DROP INDEX "User_latHash_key";

-- DropIndex
DROP INDEX "User_lngHash_key";

-- DropIndex
DROP INDEX "User_nameHash_key";

-- DropIndex
DROP INDEX "User_postalCodeHash_key";

-- DropIndex
DROP INDEX "User_regionHash_key";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_contactEmail_key" ON "Organization"("contactEmail");
