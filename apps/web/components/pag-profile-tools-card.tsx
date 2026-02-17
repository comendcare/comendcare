"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import { Database, ExternalLink, Rat, TestTubeDiagonal } from "lucide-react";
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
import {DiseaseModelDetails} from "@comend/components/disease-model-details"
import {ClinicalDatasetDetails} from "@comend/components/clinical-dataset-details"
import { BIOSAMPLE_TYPE_OPTIONS, DIAGNOSIS_SEVERITY_OPTIONS, DISEASE_MODEL_TYPE_OPTIONS, TOOL_TYPE_OPTIONS } from "@comend/lib/types";
import { Badge } from "@comend/components/ui/badge";
import { buttonVariants } from "@comend/components/ui/button";
import Link from "next/link";

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

    return (
        <Card className="organization-profile-tour-step5">
            <CardHeader className="w-full flex flex-row items-start justify-between gap-4">
                <CardTitle className="w-full flex flex-col items-start justify-between gap-4">
                    Toolkit
                </CardTitle>
            </CardHeader>
            <CardContent className="w-full max-w-full flex flex-col gap-4">
                <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TestTubeDiagonal className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium">
                                Patient biosamples
                            </span>
                            <Link
                                href={"/app/marketplace/biosamples"}
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                    className: "p-0 h-auto w-auto",
                                })}
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                            </Link>
                        </div>
                        <div className="text-lg font-semibold">
                            {biosamples.length}
                        </div>
                    </div>

                    {biosamples.length > 0 && (
                        <div className="w-full flex gap-4 flex-wrap justify-start">
                            {BIOSAMPLE_TYPE_OPTIONS
                                .filter(option => biosamples.flatMap(biosample => biosample.types).includes(option.value))
                                .map(type => (
                                    <div className="flex gap-1 items-center">
                                        <Badge variant={"blue"} className="text-sm">{type.label}</Badge>
                                        <p className="text-sm font-medium">{`x ${biosamples.filter(biosample => biosample.types.includes(type.value)).length}`}</p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Rat className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium">
                                Disease models
                            </span>
                            <Link
                                href={"/app/marketplace/disease-models"}
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                    className: "p-0 h-auto w-auto",
                                })}
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                            </Link>
                        </div>
                        <div className="text-lg font-semibold">
                            {diseaseModels.length}
                        </div>
                    </div>

                    {diseaseModels.length > 0 && (
                        <div className="w-full flex gap-4 flex-wrap justify-start">
                            {DISEASE_MODEL_TYPE_OPTIONS
                                .filter(option => diseaseModels.flatMap(diseaseModel => diseaseModel.types).includes(option.value))
                                .map(type => (
                                    <div className="flex gap-1 items-center">
                                        <Badge variant={"blue"} className="text-sm">{type.label}</Badge>
                                        <p className="text-sm font-medium">{`x ${diseaseModels.filter(diseaseModel => diseaseModel.types.includes(type.value)).length}`}</p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex itemx-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium">
                                Clinical datasets
                            </span>
                            <Link
                                href={"/app/marketplace/clinical-datasets"}
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                    className: "p-0 h-auto w-auto",
                                })}
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                            </Link>
                        </div>
                        <div className="text-lg font-semibold">
                            {clinicalDatasets.length}
                        </div>
                    </div>

                    {clinicalDatasets.length > 0 && (
                        <div className="w-full flex gap-4 flex-wrap justify-start">
                            {TOOL_TYPE_OPTIONS
                                .filter(option => clinicalDatasets.flatMap(clinicalDataset => clinicalDataset.types).includes(option.value))
                                .map(type => (
                                    <div className="flex gap-1 items-center">
                                        <Badge variant={"blue"} className="text-sm">{type.label}</Badge>
                                        <p className="text-sm font-medium">{`x ${clinicalDatasets.filter(clinicalDataset => clinicalDataset.types.includes(type.value)).length}`}</p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {(toolCounts.biosampleCount === 0 && toolCounts.diseaseModelCount === 0 && toolCounts.clinicalDatasetCount == 0) && (
                    <NoResultsTemplate 
                        imgAlt="No Data Tools"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        title="Your organization does not have any public tools"
                        description="A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, biosamples."
                    />
                )}
            </CardContent>
        </Card>
    );
}
