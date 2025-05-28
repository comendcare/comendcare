import prisma from "@/lib/prisma"
import fs from 'fs/promises';

async function main() {
    console.log('Starting seed script...');

    // Load the JSON data
    const data = JSON.parse(await fs.readFile('data/non_alt_loci_set.json', 'utf-8'));

    // Extract the `docs` array from the response
    const genes = data.response.docs;

    console.log(`Total records to process: ${genes.length}`);

    let processedCount = 0;

    for (const gene of genes) {
        try {
            // Parse date fields safely
            const parseDate = (dateString: string) => {
                const date = new Date(dateString);
                return isNaN(date.getTime()) ? null : date;
            };

            // Insert the gene data into the Prisma model
            await prisma.gene.create({
                data: {
                    uuid: gene.uuid || null,
                    symbol: gene.symbol || null,
                    name: gene.name || null,
                    hgncId: gene.hgnc_id || null,
                    locusGroup: gene.locus_group || null,
                    locusType: gene.locus_type || null,
                    location: gene.location || null,
                    locationSortable: gene.location_sortable || null,
                    entrezId: gene.entrez_id || null,
                    ensemblGeneId: gene.ensembl_gene_id || null,
                    ucscId: gene.ucsc_id || null,
                    refseqAccessions: gene.refseq_accession || [],
                    vegaId: gene.vega_id || null,
                    omimIds: gene.omim_id || [],
                    uniprotIds: gene.uniprot_ids || [],
                    aliasSymbols: gene.alias_symbol || [],
                    prevSymbols: gene.prev_symbol || [],
                    prevNames: gene.prev_name || [],
                    aliasNames: gene.alias_name || [],
                    geneGroups: gene.gene_group || [],
                    geneGroupIds: gene.gene_group_id || [],
                    pubmedIds: gene.pubmed_id || [],
                    agr: gene.agr || null,
                    status: gene.status || null,
                    dateApprovedReserved: parseDate(gene.date_approved_reserved),
                    dateModified: parseDate(gene.date_modified),
                    dateNameChanged: parseDate(gene.date_name_changed),
                    dateSymbolChanged: parseDate(gene.date_symbol_changed),
                    rnaCentralIds: gene.rna_central_id || [],
                    lncipedia: gene.lncipedia || null,
                    pseudogeneOrg: gene.pseudogene_org || null,
                    merops: gene.merops || null,
                    maneSelect: gene.mane_select || [],
                    ena: gene.ena || [],
                    ccdsIds: gene.ccds_id || [],
                    rgdIds: gene.rgd_id || [],
                    mgdIds: gene.mgd_id || [],
                    orphanet: gene.orphanet || null,
                    lsdb: gene.lsdb || [],
                },
            });

            processedCount++;

            // Log progress every 100 records
            if (processedCount % 100 === 0) {
                console.log(`Processed ${processedCount} records...`);
            }
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.error(
                    `Unique constraint violation for gene with UUID ${gene.uuid}. Skipping.`
                );
            } else {
                console.error(`Failed to process gene with UUID ${gene.uuid}:`, error);
            }
        }
    }

    console.log(`Seed script completed. Processed ${processedCount} records in total.`);
}

main()
    .then(() => {
        console.log('Seeding finished successfully!');
    })
    .catch((error) => {
        console.error('Error seeding database:', error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
