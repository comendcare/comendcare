"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import { Database, Rat, TestTubeDiagonal } from "lucide-react";
import { cn } from "@comend/lib/utils";
import { useEffect, useState } from "react";
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

const getInitState = (
    counts: {
        biosampleCount: number, 
        diseaseModelCount: number, 
        clinicalDatasetCount: number
    }, 
    searchParams: SearchParams | undefined
): string => {
    if (searchParams && searchParams.view && typeof searchParams.view === 'string') return  searchParams.view

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
    const [isInitialized, setIsInitialized] = useState<boolean>(false)    
    const [section, setSection] = useState<string | undefined>(undefined)
    const biosampleColumns = useBiosamplesTableColumns(
        true, // enable sorting
        true, // enable hiding
        "profile",
    )
    const diseaseModelColumns = useDiseaseModelsTableColumns(
        true, // enable sorting
        true, // enable hiding
        "profile"
    )
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns(
        true, // enable sorting
        true, // enable hiding
        "profile"
    )
    const router = useRouter();

    useEffect(() => {
        setSection(getInitState(toolCounts, searchParams))
        setIsInitialized(true)
    }, [])

    return (
        <Card className="organization-profile-tour-step5">
            <CardHeader className="w-full flex flex-row items-start justify-between gap-4">
                <CardTitle className="w-full flex flex-col items-start justify-between gap-4">
                    Toolkit
                </CardTitle>
            </CardHeader>
            <CardContent className="w-full max-w-full">
                <div className="text-muted-foreground text-sm flex flex-wrap gap-2 justify-end pb-4">
                    {(toolCounts.biosampleCount > 0) && (
                        <div
                            onClick={async () => {
                                const searchParams = new URLSearchParams()
                                searchParams.set("sort", "")
                                searchParams.set("page", "1")
                                searchParams.set("view", "biosamples")
                                router.push(`?${searchParams.toString()}`, {scroll: false})
                                setSection("biosamples");
                            }}
                            className={cn(
                                "min-h-fit py-2 flex h-7 items-center justify-center rounded-full px-4 text-center text-base transition-colors hover:text-primary cursor-pointer",
                                section === 'biosamples'
                                    ? "bg-blue-light font-medium text-primary"
                                    : "text-muted-foreground",
                            )}
                        >
                            {<TestTubeDiagonal className="mr-2 h-6 w-6"/>}
                            Patient biosamples ({toolCounts.biosampleCount})
                        </div>
                    )}
                    {(toolCounts.diseaseModelCount > 0) && (
                        <div
                            onClick={async () => {
                                const searchParams = new URLSearchParams()
                                searchParams.set("sort", "")
                                searchParams.set("page", "1")
                                searchParams.set("view", "disease-models")
                                router.push(`?${searchParams.toString()}`, {scroll: false})
                                setSection("disease-models");
                            }}
                            className={cn(
                                "min-h-fit py-2 flex h-7 items-center justify-center rounded-full px-4 text-center text-base transition-colors hover:text-primary cursor-pointer",
                                section === 'disease-models'
                                    ? "bg-blue-light font-medium text-primary"
                                    : "text-muted-foreground",
                            )}
                        >
                            {<Rat className="mr-2 h-6 w-6"/>}
                            Disease models ({toolCounts.diseaseModelCount})
                        </div>
                    )}
                    {(toolCounts.clinicalDatasetCount > 0) && (
                        <div
                            onClick={async () => {
                                const searchParams = new URLSearchParams()
                                searchParams.set("sort", "")
                                searchParams.set("page", "1")
                                searchParams.set("view", "clinical-datasets")
                                router.push(`?${searchParams.toString()}`, {scroll: false})
                                setSection('clinical-datasets')
                            }}
                            className={cn(
                                "min-h-fit py-2 flex h-7 items-center justify-center rounded-full px-4 text-center text-base transition-colors hover:text-primary cursor-pointer",
                                section === 'clinical-datasets'
                                    ? "bg-blue-light font-medium text-primary"
                                    : "text-muted-foreground",
                            )}
                        >
                            {<Database className="mr-2 h-6 w-6"/>}
                            Clinical datasets ({toolCounts.clinicalDatasetCount})
                        </div>
                    )}
                </div>
                {(isInitialized && section === 'biosamples') && 
                    (biosamples.length === 0 ? (
                        <div className="bg-gray-100 rounded-md w-full h-[200px]" />
                    ) : (
                        <div className="max-w-7xl w-full overflow-auto">
                            <FeatureFlagsProvider showFilters={false}>
                                <BiosamplesTable
                                    data={biosamples as any[] || []}
                                    pageCount={biosamplesPageCount}
                                    columns={biosampleColumns}
                                    searchParams={{}}
                                    interactive={false}
                                    showPagination={toolCounts.biosampleCount > 10}
                                />
                            </FeatureFlagsProvider>
                        </div>
                    ))
                }
                {(isInitialized && section === 'disease-models') && (
                    diseaseModels.length === 0 ? (
                        <div className="bg-gray-100 rounded-md w-full h-[200px]" />
                    ) : (
                        <div className="max-w-7xl w-full overflow-auto">
                            <FeatureFlagsProvider showFilters={false}>
                                <DiseaseModelsTable
                                    data={diseaseModels as any[] || []}
                                    pageCount={diseaseModelsPageCount}
                                    columns={diseaseModelColumns}
                                    searchParams={{}}
                                    interactive={false}
                                    showPagination={toolCounts.diseaseModelCount > 10}
                                />
                            </FeatureFlagsProvider>
                        </div>
                    )
                )}
                {(isInitialized && section === 'clinical-datasets') && (
                    clinicalDatasets.length === 0 ? (
                        <div className="bg-gray-100 rounded-md w-full h-[200px]" />
                    ) : (
                        <div className="max-w-7xl w-full overflow-auto">
                            <FeatureFlagsProvider showFilters={false}>
                                <ClinicalDatasetsTable
                                    data={clinicalDatasets || []}
                                    pageCount={clinicalDatasetsPageCount}
                                    columns={clinicalDatasetColumns}
                                    searchParams={{}}
                                    interactive={false}
                                    showPagination={toolCounts.clinicalDatasetCount > 10}
                                />
                            </FeatureFlagsProvider>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}
