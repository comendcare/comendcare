"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import { Database, Rat, TestTubeDiagonal } from "lucide-react";
import { cn } from "@comend/lib/utils";
import { useState } from "react";
import { Button } from "@/packages/components/ui/button";
import { BiosamplesTable } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/private-biosamples-table";
import { useBiosamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns";
import { useClinicalDatasetsTableColumns } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns";
import { useDiseaseModelsTableColumns } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns";
import { DiseaseModelsTable } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/private-disease-models-table";
import { ClinicalDatasetsTable } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/private-clinical-datasets-table";
import { SearchParams } from "@/packages/components/types";
import type { Organization, Biosample, DiseaseModel, Tool } from "@prisma/client";
import { FeatureFlagsProvider } from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { ToolCounts } from "./profile-page";
import { useRouter } from "next/navigation";

const getInitState = (counts: {biosampleCount: number, diseaseModelCount: number, clinicalDatasetCount: number}) => {
    if (counts.biosampleCount > 0) return 'biosamples'
    if (counts.diseaseModelCount > 0) return 'disease-models'
    if (counts.clinicalDatasetCount > 0) return 'clinical-datasets'

    return 'biosamples'
}

export const PAGProfileToolsCard = ({
    organization, 
    searchParams,
    toolCounts,
    biosamples,
    biosamplesPageCount,
    diseaseModels,
    diseaseModelsPageCount,
    clinicalDatasets,
    clinicalDatasetsPageCount,
} : {
    organization: Partial<Organization>,
    searchParams?: SearchParams | undefined,
    toolCounts: ToolCounts,
    biosamples: Biosample[];
    biosamplesPageCount: number;
    diseaseModels: DiseaseModel[];
    diseaseModelsPageCount: number;
    clinicalDatasets: Tool[];
    clinicalDatasetsPageCount: number;
}) => {
    console.log(`biosamples`, biosamples)
    const [section, setSection] = useState<'biosamples' | 'disease-models' | 'clinical-datasets'>(getInitState(toolCounts))
    const biosampleColumns = useBiosamplesTableColumns(
        false, // disable sorting
        false, // disable hiding
        "profile",
    )
    const diseaseModelColumns = useDiseaseModelsTableColumns("profile")
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns("profile")
    const router = useRouter();

    return (
        <Card className="organization-profile-tour-step5">
            <CardHeader className="w-full flex flex-row items-start justify-between gap-4">
                <CardTitle className="w-full flex flex-col items-start justify-between gap-4">
                    Toolkit
                    <div className="text-muted-foreground text-sm flex flex-wrap gap-2 justify-end">
                        {(toolCounts.biosampleCount > 0) && (
                            <Button
                                variant={"link"}
                                onClick={async () => {
                                    router.push(window.location.pathname, { scroll: false })
                                    setSection("biosamples");
                                }}
                                className={cn(
                                    "hover:no-underline min-h-fit py-2 flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                                    section === 'biosamples'
                                        ? "bg-blue-light font-medium text-primary"
                                        : "text-muted-foreground",
                                )}
                            >
                                {<TestTubeDiagonal className="mr-2 h-4 w-4"/>}
                                Biosamples ({toolCounts.biosampleCount})
                            </Button>
                        )}
                        {(toolCounts.diseaseModelCount > 0) && (
                            <Button
                                variant={"link"}
                                onClick={async () => {
                                    router.push(window.location.pathname, { scroll: false })
                                    setSection("disease-models");
                                }}
                                className={cn(
                                    "hover:no-underline min-h-fit py-2 flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                                    section === 'disease-models'
                                        ? "bg-blue-light font-medium text-primary"
                                        : "text-muted-foreground",
                                )}
                            >
                                {<Rat className="mr-2 h-4 w-4"/>}
                                Disease Models ({toolCounts.diseaseModelCount})
                            </Button>
                        )}
                        {(toolCounts.clinicalDatasetCount > 0) && (
                            <Button
                                variant={"link"}
                                onClick={async () => {
                                    router.push(window.location.pathname, { scroll: false })
                                    setSection('clinical-datasets')
                                }}
                                className={cn(
                                    "hover:no-underline min-h-fit py-2 flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                                    section === 'clinical-datasets'
                                        ? "bg-blue-light font-medium text-primary"
                                        : "text-muted-foreground",
                                )}
                            >
                                {<Database className="mr-2 h-4 w-4"/>}
                                Clinical Datasets ({toolCounts.clinicalDatasetCount})
                            </Button>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="w-full max-w-full">
                {section === 'biosamples' && (
                    <div className="max-w-7xl w-full overflow-auto">
                        <FeatureFlagsProvider showFilters={false}>
                            <BiosamplesTable
                                data={biosamples as any[] || []}
                                pageCount={biosamplesPageCount}
                                columns={biosampleColumns}
                                searchParams={{}}
                                showFilters={false}
                                interactive={false}
                                showPagination={toolCounts.biosampleCount > 10}
                            />
                        </FeatureFlagsProvider>
                    </div>
                )}
                {section === 'disease-models' && (
                    <div className="max-w-7xl w-full overflow-auto">
                        <FeatureFlagsProvider showFilters={false}>
                            <DiseaseModelsTable
                                data={diseaseModels as any[] || []}
                                pageCount={diseaseModelsPageCount}
                                columns={diseaseModelColumns}
                                searchParams={{}}
                                showFilters={false}
                                interactive={false}
                                showPagination={toolCounts.diseaseModelCount > 10}
                            />
                        </FeatureFlagsProvider>
                    </div>
                )}
                {section === 'clinical-datasets' && (
                    <div className="max-w-7xl w-full overflow-auto">
                        <FeatureFlagsProvider showFilters={false}>
                            <ClinicalDatasetsTable
                                data={clinicalDatasets || []}
                                pageCount={clinicalDatasetsPageCount}
                                columns={clinicalDatasetColumns}
                                searchParams={{}}
                                showFilters={false}
                                interactive={false}
                                showPagination={toolCounts.clinicalDatasetCount > 10}
                            />
                        </FeatureFlagsProvider>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
