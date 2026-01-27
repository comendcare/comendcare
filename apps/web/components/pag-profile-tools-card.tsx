"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import { Database, Rat, TestTubeDiagonal } from "lucide-react";
import { cn, sleep } from "@comend/lib/utils";
import { useEffect, useState } from "react";
import { DatabaseBiosamplesTable } from "@comend/components/biorepo/advanced-data-table/biosamples-table/database-biosamples-table";
import { useBiosamplesTableColumns } from "@comend/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns";
import { useClinicalDatasetsTableColumns } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns";
import { useDiseaseModelsTableColumns } from "@comend/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns";
import { DatabaseDiseaseModelsTable } from "@comend/components/biorepo/advanced-data-table/disease-models-table/database-disease-models-table";
import { DatabaseClinicalDatasetsTable } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/database-clinical-datasets-table";
import { SearchParams } from "@comend/components/types";
import type { Organization, Biosample, DiseaseModel, Tool } from "@prisma/client";
import { FeatureFlagsProvider } from "@comend/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { ToolCounts } from "./profile-page";
import { useRouter } from "next/navigation";
import Image from "next/image"
import {NoResultsTemplate} from "@comend/components/no-results"
import { Row } from "@tanstack/react-table";
import { Dialog, DialogContent } from "@comend/components/ui/dialog";
import {BiosampleDetails} from "@comend/components/biosample-details"

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
    const [biosample, setBiosample] = useState<Biosample | undefined>(undefined)
    const biosampleColumns = useBiosamplesTableColumns(
        true, // enable sorting
        true, // enable hiding
        false,
        "profile",
    )
    const diseaseModelColumns = useDiseaseModelsTableColumns(
        true, // enable sorting
        true, // enable hiding
        false,
        "profile"
    )
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns(
        true, // enable sorting
        true, // enable hiding
        false,
        "profile"
    )
    const router = useRouter();

    useEffect(() => {
        setSection(getInitState(toolCounts, searchParams))
        setIsInitialized(true)
    }, [])

    useEffect(() => {
        setIsInitialized(true)
    }, [biosamples, diseaseModels, clinicalDatasets])

    return (
        <Card className="organization-profile-tour-step5">
            <CardHeader className="w-full flex flex-row items-start justify-between gap-4">
                <CardTitle className="w-full flex flex-col items-start justify-between gap-4">
                    Toolkit
                </CardTitle>
            </CardHeader>
            <CardContent className="w-full max-w-full flex flex-col justify-center items-center">
                <div className="w-full text-muted-foreground text-sm flex flex-wrap gap-2 justify-end pb-4">
                    {(toolCounts.biosampleCount > 0) && (
                        <div
                            onClick={async () => {
                                setIsInitialized(false)
                                const searchParams = new URLSearchParams()
                                searchParams.set("sort", "")
                                searchParams.set("page", "1")
                                searchParams.set("view", "biosamples")
                                router.push(`?${searchParams.toString()}`, {scroll: false})
                                setSection("biosamples");
                                // await sleep(1000)
                                // setIsInitialized(true)
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
                                setIsInitialized(false)
                                const searchParams = new URLSearchParams()
                                searchParams.set("sort", "")
                                searchParams.set("page", "1")
                                searchParams.set("view", "disease-models")
                                router.push(`?${searchParams.toString()}`, {scroll: false})
                                setSection("disease-models");
                                // await sleep(1000)
                                // setIsInitialized(true)
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
                                setIsInitialized(false)
                                const searchParams = new URLSearchParams()
                                searchParams.set("sort", "")
                                searchParams.set("page", "1")
                                searchParams.set("view", "clinical-datasets")
                                router.push(`?${searchParams.toString()}`, {scroll: false})
                                setSection('clinical-datasets')
                                // await sleep(1000)
                                // setIsInitialized(true)
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

                {!isInitialized 
                    ? (<div className="bg-gray-100 rounded-md w-full h-[200px]" />) 
                    : (
                        <>
                            {(section === 'biosamples' && toolCounts.biosampleCount > 0) && (
                                <div className="max-w-7xl w-full overflow-auto">
                                    <FeatureFlagsProvider showFilters={false}>
                                        <DatabaseBiosamplesTable
                                            data={biosamples as any[] || []}
                                            pageCount={biosamplesPageCount}
                                            columns={biosampleColumns}
                                            searchParams={{}}
                                            showPagination={toolCounts.biosampleCount > 10}
                                            onRowClickCallback={(e: any, row: Row<any> | undefined) => setBiosample(row?.original as Biosample)}
                                        />
                                    </FeatureFlagsProvider>
                                </div>
                            )}
                            {(section === 'disease-models' && toolCounts.diseaseModelCount > 0) && (
                                <div className="max-w-7xl w-full overflow-auto">
                                    <FeatureFlagsProvider showFilters={false}>
                                        <DatabaseDiseaseModelsTable
                                            data={diseaseModels as any[] || []}
                                            pageCount={diseaseModelsPageCount}
                                            columns={diseaseModelColumns}
                                            searchParams={{}}
                                            showPagination={toolCounts.diseaseModelCount > 10}
                                        />
                                    </FeatureFlagsProvider>
                                </div>
                            )}
                            {(section === 'clinical-datasets' && toolCounts.clinicalDatasetCount > 0) && (
                                <div className="max-w-7xl w-full overflow-auto">
                                    <FeatureFlagsProvider showFilters={false}>
                                        <DatabaseClinicalDatasetsTable
                                            data={clinicalDatasets || []}
                                            pageCount={clinicalDatasetsPageCount}
                                            columns={clinicalDatasetColumns}
                                            searchParams={{}}
                                            showPagination={toolCounts.clinicalDatasetCount > 10}
                                        />
                                    </FeatureFlagsProvider>
                                </div>
                            )}
                        </>
                    )
                }

                {(toolCounts.biosampleCount === 0 && toolCounts.diseaseModelCount === 0 && toolCounts.clinicalDatasetCount == 0) && (
                    <NoResultsTemplate 
                        imgAlt="No Data Tools"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        title="Your organization does not have any public tools"
                        description="A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, biosamples."
                    />
                )}
            </CardContent>

            <Dialog 
                open={!!biosample} 
                onOpenChange={
                    (open) => {
                        if (!open) setBiosample(undefined)
                    }
                }
            >
                <DialogContent>
                    <BiosampleDetails biosample={biosample} />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
