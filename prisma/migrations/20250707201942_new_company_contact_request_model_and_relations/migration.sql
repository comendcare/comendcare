-- CreateTable
CREATE TABLE "CompanyContactRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "CompanyContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyContactRequestToService" (
    "id" TEXT NOT NULL,
    "companyContactRequestId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "CompanyContactRequestToService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyContactRequestToRFP" (
    "id" TEXT NOT NULL,
    "companyContactRequestId" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "CompanyContactRequestToRFP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyContactRequestToService_companyContactRequestId_serv_key" ON "CompanyContactRequestToService"("companyContactRequestId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyContactRequestToRFP_companyContactRequestId_rfpId_key" ON "CompanyContactRequestToRFP"("companyContactRequestId", "rfpId");

-- AddForeignKey
ALTER TABLE "CompanyContactRequest" ADD CONSTRAINT "CompanyContactRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContactRequest" ADD CONSTRAINT "CompanyContactRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContactRequestToService" ADD CONSTRAINT "CompanyContactRequestToService_companyContactRequestId_fkey" FOREIGN KEY ("companyContactRequestId") REFERENCES "CompanyContactRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContactRequestToService" ADD CONSTRAINT "CompanyContactRequestToService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContactRequestToRFP" ADD CONSTRAINT "CompanyContactRequestToRFP_companyContactRequestId_fkey" FOREIGN KEY ("companyContactRequestId") REFERENCES "CompanyContactRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContactRequestToRFP" ADD CONSTRAINT "CompanyContactRequestToRFP_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "RFP"("id") ON DELETE CASCADE ON UPDATE CASCADE;
