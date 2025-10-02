"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import { Database, Rat, TestTubeDiagonal } from "lucide-react";
import { cn } from "@comend/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/packages/components/ui/button";
import { BiosamplesTable } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table";
import { useBiosamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns";
import { useClinicalDatasetsTableColumns } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns";
import { useDiseaseModelsTableColumns } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns";
import { DiseaseModelsTable } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table";
import { ClinicalDatasetsTable } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table";
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore";
import { useShallow } from "zustand/react/shallow";
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore";
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore";
import { SearchParams } from "@/packages/components/types";
import { useQueryState } from "nuqs";

const biosamplesSelector = (state: BiosampleSearchState) => ({
    searchResults: state.searchResults,
    setFilters: state.setFilters,
    setSortBy: state.setSortBy,
})

const diseaseModelsSelector = (state: DiseaseModelSearchState) => ({
    searchResults: state.searchResults,
    setFilters: state.setFilters,
    setSortBy: state.setSortBy,
})

const clinicalDatasetsSelector = (state: ClinicalDatasetSearchState) => ({
    searchResults: state.searchResults,
    setFilters: state.setFilters,
    setSortBy: state.setSortBy,
})

const getInitState = (counts: {biosampleCount: number, diseaseModelCount: number, clinicalDatasetCount: number}) => {
    if (counts.biosampleCount > 0) return 'biosamples'
    if (counts.diseaseModelCount > 0) return 'disease-models'
    if (counts.clinicalDatasetCount > 0) return 'clinical-datasets'

    return 'biosamples'
}

export const PAGProfileToolsCard = ({organizationId, toolCounts, searchParams} : {organizationId: string, toolCounts: {biosampleCount: number, diseaseModelCount: number, clinicalDatasetCount: number}, searchParams?: SearchParams | undefined}) => {
    const [section, setSection] = useState<'biosamples' | 'disease-models' | 'clinical-datasets'>(getInitState(toolCounts))
    const [sort, setSort] = useQueryState("sort");
    const { 
        searchResults: biosamples,
        setFilters: setBiosampleFilters,
        setSortBy: setBiosampleSortBy,
    } = useBiosampleSearchStore(useShallow(biosamplesSelector))
    const biosampleColumns = useBiosamplesTableColumns()
    const { 
        searchResults: diseaseModels,
        setFilters: setDiseaseModelFilters,
        setSortBy: setDiseaseModelSortBy,
    } = useDiseaseModelSearchStore(useShallow(diseaseModelsSelector))
    const diseaseModelColumns = useDiseaseModelsTableColumns()
    const { 
        searchResults: clinicalDatasets,
        setFilters: setClinicalDatasetFilters,
        setSortBy: setClinicalDatasetSortBy,
    } = useClinicalDatasetSearchStore(useShallow(clinicalDatasetsSelector))
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns()

    if (section === 'biosamples') setBiosampleSortBy(searchParams?.sort)
    if (section === 'disease-models') setDiseaseModelSortBy(searchParams?.sort)
    if (section === 'clinical-datasets') setClinicalDatasetSortBy(searchParams?.sort)

    useEffect(() => {
        setBiosampleFilters({
            conditions: [],
            genes: [],
            types: [],
            organizations: [{label: '', value: organizationId}]
        })
        setDiseaseModelFilters({
            conditions: [],
            genes: [],
            types: [],
            organizations: [{label: '', value: organizationId}]
        })
        setClinicalDatasetFilters({
            conditions: [],
            genes: [],
            types: [],
            organizations: [{label: '', value: organizationId}]
        })
    }, [])

    return (
        <Card className="organization-profile-tour-step5">
            <CardHeader className="w-full flex flex-row items-start justify-between gap-4">
                <CardTitle className="w-full flex flex-row items-center justify-between">
                    Tools
                    <div className="text-muted-foreground text-sm flex flex-wrap gap-2 justify-end">
                        {toolCounts.biosampleCount > 0 && (
                            <Button
                                variant={"link"}
                                onClick={async () => {
                                    await setSort(null)
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
                        {toolCounts.diseaseModelCount > 0 && (
                            <Button
                                variant={"link"}
                                onClick={async () => {
                                    await setSort(null)
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
                        {toolCounts.clinicalDatasetCount > 0 && (
                            <Button
                                variant={"link"}
                                onClick={async () => {
                                    await setSort(null)
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
                        <BiosamplesTable
                            data={biosamples || []}
                            pageCount={1}
                            columns={biosampleColumns}
                            searchParams={{}}
                            showPagination={toolCounts.biosampleCount > 10}
                        />
                    </div>
                )}
                {section === 'disease-models' && (
                    <div className="max-w-7xl w-full overflow-auto">
                        <DiseaseModelsTable
                            data={diseaseModels || []}
                            pageCount={1}
                            columns={diseaseModelColumns}
                            searchParams={{}}
                            showPagination={toolCounts.diseaseModelCount > 10}
                        />
                    </div>
                )}
                {section === 'clinical-datasets' && (
                    <div className="max-w-7xl w-full overflow-auto">
                        <ClinicalDatasetsTable
                            data={clinicalDatasets || []}
                            pageCount={1}
                            columns={clinicalDatasetColumns}
                            searchParams={{}}
                            showPagination={toolCounts.clinicalDatasetCount > 10}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
