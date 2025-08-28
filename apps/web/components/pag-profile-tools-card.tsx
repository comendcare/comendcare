"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Building, Calendar, Database, DollarSign, FileText, GraduationCap, Link as LinkIcon, Pin, Rat, TestTubeDiagonal, User } from "lucide-react";
import { DateView } from "./miletone-date-view";
import Link from "next/link";
import { ScrollArea } from "@comend/components/ui/scroll-area";
import { PropertyBadge } from "./property-badge";
import { cn, formatMoney } from "@comend/lib/utils";
import { mixpanelTrack } from "@comend/lib/mixpanel";
import { useSearchParams } from "next/navigation";
import { NoRFPs } from "./no-rfps";
import { RFPCard } from "./rfp-card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselApi } from "@/packages/components/ui/carousel";
import { Suspense, useEffect, useState } from "react";
import { ToolsNav } from "./tools-nav";
import { Button } from "@/packages/components/ui/button";
import { BiosamplesTable } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table";
import { useBiosamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns";
import { useClinicalDatasetsTableColumns } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns";
import { useDiseaseModelsTableColumns } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns";
import { Biosample, DiseaseModel, Tool } from "@prisma/client";
import { DiseaseModelsTable } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table";
import { ClinicalDatasetsTable } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table";
import { Shell } from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import { DataTableSkeleton } from "@/packages/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore";
import { useShallow } from "zustand/react/shallow";
import { NoResultsView } from "./marketplace/no-results";
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore";
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore";
import { useSession } from "next-auth/react";

const biosamplesSelector = (state: BiosampleSearchState) => ({
    searchResults: state.searchResults,
    setFilters: state.setFilters,
    
})

const diseaseModelsSelector = (state: DiseaseModelSearchState) => ({
    searchResults: state.searchResults,
    setFilters: state.setFilters,
})

const clinicalDatasetsSelector = (state: ClinicalDatasetSearchState) => ({
    searchResults: state.searchResults,
    setFilters: state.setFilters,
})

export const PAGProfileToolsCard = ({organizationId} : {organizationId: string}) => {
    const [section, setSection] = useState<'biosamples' | 'disease-models' | 'clinical-datasets'>('biosamples')
    const { 
        searchResults: biosamples,
        setFilters: setBiosampleFilters,
    } = useBiosampleSearchStore(useShallow(biosamplesSelector))
    const biosampleColumns = useBiosamplesTableColumns()
    const { 
        searchResults: diseaseModels,
        setFilters: setDiseaseModelFilters,
    } = useDiseaseModelSearchStore(useShallow(diseaseModelsSelector))
    const diseaseModelColumns = useDiseaseModelsTableColumns()
    const { 
        searchResults: clinicalDatasets,
        setFilters: setClinicalDatasetFilters,
    } = useClinicalDatasetSearchStore(useShallow(clinicalDatasetsSelector))
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns()

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
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <CardTitle>Tools</CardTitle>
                <div className="text-muted-foreground text-sm flex flex-wrap gap-4 justify-end">
                    <Button
                        variant={"link"}
                        onClick={() => setSection('biosamples')}
                        className={cn(
                            "hover:no-underline min-h-fit py-2 flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                            section === 'biosamples'
                                ? "bg-blue-light font-medium text-primary"
                                : "text-muted-foreground",
                        )}
                    >
                        {<TestTubeDiagonal className="mr-2 h-4 w-4"/>}
                        Biosamples
                    </Button>
                    <Button
                        variant={"link"}
                        onClick={() => setSection('disease-models')}
                        className={cn(
                            "hover:no-underline min-h-fit py-2 flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                            section === 'disease-models'
                                ? "bg-blue-light font-medium text-primary"
                                : "text-muted-foreground",
                        )}
                    >
                        {<Rat className="mr-2 h-4 w-4"/>}
                        Disease Models
                    </Button>
                    <Button
                        variant={"link"}
                        onClick={() => setSection('clinical-datasets')}
                        className={cn(
                            "hover:no-underline min-h-fit py-2 flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                            section === 'clinical-datasets'
                                ? "bg-blue-light font-medium text-primary"
                                : "text-muted-foreground",
                        )}
                    >
                        {<Database className="mr-2 h-4 w-4"/>}
                        Clinical Datasets
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="w-full max-w-full">
                {section === 'biosamples' && (
                    <div className="max-w-7xl w-full overflow-auto">
                        <BiosamplesTable data={biosamples || []} pageCount={1} columns={biosampleColumns} searchParams={{}}/>
                    </div>
                )}
                {section === 'disease-models' && (
                    <div className="max-w-7xl w-full overflow-auto">
                        <DiseaseModelsTable data={diseaseModels || []} pageCount={1} columns={diseaseModelColumns} searchParams={{}}/>
                    </div>
                )}
                {section === 'clinical-datasets' && (
                    <div className="max-w-7xl w-full overflow-auto">
                        <ClinicalDatasetsTable data={clinicalDatasets || []} pageCount={1} columns={clinicalDatasetColumns} searchParams={{}}/>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
