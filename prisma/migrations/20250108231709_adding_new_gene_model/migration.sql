-- CreateTable
CREATE TABLE "Gene" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hgncId" TEXT NOT NULL,
    "locusGroup" TEXT NOT NULL,
    "locusType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "locationSortable" TEXT NOT NULL,
    "entrezId" TEXT NOT NULL,
    "ensemblGeneId" TEXT NOT NULL,
    "ucscId" TEXT NOT NULL,
    "refseqAccessions" TEXT[],
    "vegaId" TEXT NOT NULL,
    "omimIds" TEXT[],
    "uniprotIds" TEXT[],
    "aliasSymbols" TEXT[],
    "prevSymbols" TEXT[],
    "prevNames" TEXT[],
    "aliasNames" TEXT[],
    "geneGroups" TEXT[],
    "geneGroupIds" INTEGER[],
    "pubmedIds" INTEGER[],
    "agr" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dateApprovedReserved" TIMESTAMP(3) NOT NULL,
    "dateModified" TIMESTAMP(3) NOT NULL,
    "dateNameChanged" TIMESTAMP(3),
    "dateSymbolChanged" TIMESTAMP(3),
    "rnaCentralIds" TEXT[],
    "lncipedia" TEXT,
    "pseudogeneOrg" TEXT,
    "merops" TEXT,
    "maneSelect" TEXT[],
    "ena" TEXT[],
    "ccdsIds" TEXT[],
    "rgdIds" TEXT[],
    "mgdIds" TEXT[],
    "orphanet" INTEGER,
    "lsdb" TEXT[],

    CONSTRAINT "Gene_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gene_uuid_key" ON "Gene"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_symbol_key" ON "Gene"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_ensemblGeneId_key" ON "Gene"("ensemblGeneId");

-- CreateIndex
CREATE INDEX "idx_symbol" ON "Gene"("symbol");
