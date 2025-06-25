-- CreateTable
CREATE TABLE "SavedOrganization" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "savedOrganizationId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "SavedOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedOrganization_organizationId_savedOrganizationId_key" ON "SavedOrganization"("organizationId", "savedOrganizationId");

-- AddForeignKey
ALTER TABLE "SavedOrganization" ADD CONSTRAINT "SavedOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOrganization" ADD CONSTRAINT "SavedOrganization_savedOrganizationId_fkey" FOREIGN KEY ("savedOrganizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
