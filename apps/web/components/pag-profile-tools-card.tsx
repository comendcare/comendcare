"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import { Database, ExternalLink, Rat, TestTubeDiagonal } from "lucide-react";
import type { Organization, Biosample, DiseaseModel, Tool } from "@prisma/client";
import { ToolCounts } from "./profile-page";
import { usePathname } from "next/navigation";
import {NoResultsTemplate} from "@comend/components/no-results"
import { BIOSAMPLE_TYPE_OPTIONS, DISEASE_MODEL_TYPE_OPTIONS, TOOL_TYPE_OPTIONS } from "@comend/lib/types";
import { Badge } from "@comend/components/ui/badge";
import { buttonVariants } from "@comend/components/ui/button";
import Link from "next/link";

export const PAGProfileToolsCard = ({
    organization, 
    toolCounts,
    biosamples,
    diseaseModels,
    clinicalDatasets,
} : {
    organization: Partial<Organization>,
    toolCounts: ToolCounts,
    biosamples: Biosample[];
    diseaseModels: DiseaseModel[];
    clinicalDatasets: Tool[];
}) => {
    const pathname = usePathname()

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
                                target="_blank"
                                href={pathname === "/app/profile" 
                                    ? `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/biosamples?filters={"organizations":["${organization.id}"]}` 
                                    : `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/marketplace/biosamples?filters={"organizations":["${organization.id}"]}`}
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
                        <div 
                            className="w-full flex gap-4 flex-wrap justify-start"
                        >
                            {BIOSAMPLE_TYPE_OPTIONS
                                .filter(option => biosamples.flatMap(biosample => biosample.types).includes(option.value))
                                .map(type => (
                                    <Link 
                                        target="_blank"
                                        href={pathname === "/app/profile" 
                                            ? `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/biosamples?filters={"types":["${type.value}"],"organizations":["${organization.id}"]}` 
                                            : `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/marketplace/biosamples?filters={"types":["${type.value}"],"organizations":["${organization.id}"]}`}
                                        className="flex gap-1 items-center text-sm font-normal hover:font-semibold"
                                    >
                                        <Badge variant={"blue"}>{type.label}</Badge>
                                        <p>{`x ${biosamples.filter(biosample => biosample.types.includes(type.value)).length}`}</p>
                                    </Link>
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
                                target="_blank"
                                href={pathname === "/app/profile" 
                                    ? `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/disease-models?filters={"organizations":["${organization.id}"]}` 
                                    : `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/marketplace/disease-models?filters={"organizations":["${organization.id}"]}`}
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
                                    <Link
                                        target="_blank"
                                        href={pathname === "/app/profile" 
                                            ? `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/disease-models?filters={"types":["${type.value}"],"organizations":["${organization.id}"]}` 
                                            : `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/marketplace/disease-models?filters={"types":["${type.value}"],"organizations":["${organization.id}"]}`}
                                        className="flex gap-1 items-center text-sm font-normal hover:font-semibold"
                                    >
                                        <Badge variant={"blue"} className="text-sm" onClick={() => {}}>{type.label}</Badge>
                                        <p className="text-sm font-medium">{`x ${diseaseModels.filter(diseaseModel => diseaseModel.types.includes(type.value)).length}`}</p>
                                    </Link>
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
                                target="_blank"
                                href={pathname === "/app/profile" 
                                    ? `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/clinical-datasets?filters={"organizations":["${organization.id}"]}` 
                                    : `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/marketplace/clinical-datasets?filters={"organizations":["${organization.id}"]}`}
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
                                    <Link 
                                        target="_blank"
                                        href={pathname === "/app/profile" 
                                            ? `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/clinical-datasets?filters={"types":["${type.value}"],"organizations":["${organization.id}"]}` 
                                            : `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/marketplace/clinical-datasets?filters={"types":["${type.value}"],"organizations":["${organization.id}"]}`}
                                        className="flex gap-1 items-center text-sm font-normal hover:font-semibold"
                                    >
                                        <Badge variant={"blue"} className="text-sm">{type.label}</Badge>
                                        <p className="text-sm font-medium">{`x ${clinicalDatasets.filter(clinicalDataset => clinicalDataset.types.includes(type.value)).length}`}</p>
                                    </Link>
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
