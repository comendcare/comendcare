/*
  Warnings:

  - A unique constraint covering the columns `[nameHash]` on the table `ExternalContact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactEmailHash]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nameHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[address1Hash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[address2Hash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cityHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[countryHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[formattedAddressHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postalCodeHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[regionHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[latHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lngHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ExternalContact" ADD COLUMN     "nameHash" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "contactEmailHash" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address1Hash" TEXT,
ADD COLUMN     "address2Hash" TEXT,
ADD COLUMN     "cityHash" TEXT,
ADD COLUMN     "countryHash" TEXT,
ADD COLUMN     "formattedAddressHash" TEXT,
ADD COLUMN     "latHash" TEXT,
ADD COLUMN     "lngHash" TEXT,
ADD COLUMN     "nameHash" TEXT,
ADD COLUMN     "postalCodeHash" TEXT,
ADD COLUMN     "regionHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ExternalContact_nameHash_key" ON "ExternalContact"("nameHash");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_contactEmailHash_key" ON "Organization"("contactEmailHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_nameHash_key" ON "User"("nameHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_address1Hash_key" ON "User"("address1Hash");

-- CreateIndex
CREATE UNIQUE INDEX "User_address2Hash_key" ON "User"("address2Hash");

-- CreateIndex
CREATE UNIQUE INDEX "User_cityHash_key" ON "User"("cityHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_countryHash_key" ON "User"("countryHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_formattedAddressHash_key" ON "User"("formattedAddressHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_postalCodeHash_key" ON "User"("postalCodeHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_regionHash_key" ON "User"("regionHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_latHash_key" ON "User"("latHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_lngHash_key" ON "User"("lngHash");
