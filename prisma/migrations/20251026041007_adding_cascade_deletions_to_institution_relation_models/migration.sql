-- DropForeignKey
ALTER TABLE "Affiliation" DROP CONSTRAINT "Affiliation_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "InstitutionRelationship" DROP CONSTRAINT "InstitutionRelationship_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "InstitutionRelationship" DROP CONSTRAINT "InstitutionRelationship_relatedId_fkey";

-- AddForeignKey
ALTER TABLE "InstitutionRelationship" ADD CONSTRAINT "InstitutionRelationship_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionRelationship" ADD CONSTRAINT "InstitutionRelationship_relatedId_fkey" FOREIGN KEY ("relatedId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
