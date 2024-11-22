import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHeader,
    TableHead,
    TableRow
} from "@/components/ui/table";

const sites = [
    { name: "HGNC", url: "https://www.genenames.org/" },
    { name: "NCBI Gene", url: "https://www.ncbi.nlm.nih.gov/gene/" },
    { name: "Ensembl", url: "https://www.ensembl.org/" },
    { name: "OMIM®", url: "https://www.omim.org/" },
    { name: "UniProtKB/Swiss-Prot", url: "https://www.uniprot.org/" },
    { name: "OLS", url: "https://www.ebi.ac.uk/ols/index" },
    { name: "Human Phenotype Ontology", url: "https://hpo.jax.org/" },
    { name: "Orphanet", url: "https://www.orpha.net/" },
    { name: "ClinVar", url: "https://www.ncbi.nlm.nih.gov/clinvar/" },
    { name: "MedlinePlus", url: "https://medlineplus.gov/" },
    { name: "NORD", url: "https://rarediseases.org/" },
    { name: "GARD", url: "https://rarediseases.info.nih.gov/" },
];

export function ExternalDiseaseProfilesTable() {
    return (
        <Table>
            <TableCaption>Links to external disease profile sites.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Site</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sites.map((site) => (
                    <TableRow key={site.name}>
                        <TableCell>
                            <a
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                {site.name}
                            </a>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
