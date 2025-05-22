"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {usePathname, useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import "@xyflow/react/dist/base.css"
import {PublicFlowView} from "./public-flow";
import {PublicTimelineView} from "./public-timeline";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./ui/tabs";
import Image from "next/image"
import {Button} from "@/components/ui/button";
import Link from "next/link";
import { buttonVariants } from "./plate-ui/button";
import { ChevronsUpDown, Pencil, Plus, Variable } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Milestone, MODALITIES, Option, RESEARCH_PLAN_TYPES, Roadmap } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Organization } from "@prisma/client";
import { PrivateNoResearchPlansColumn, PrivateNoResearchPlansRow, PublicNoResearchPlans } from "./no-research-plans";
import { NoProjects } from "./no-projects";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { FunctionComponent, ReactElement, useState } from "react";
import { labels } from "@/lib/data";

export const RoadmapsCard = ({
    roadmaps,
    organization,
}: {
    roadmaps: any[],
    organization: Organization,
}) => {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <Card className="organization-profile-tour-step4">
            <CardHeader className="w-full pt-6 pb-2 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-0">
                    <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">
                        Research Plans
                    </CardTitle>
                    {pathname === "/app/profile" &&
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/app/research-plan")}
                            className="inline-flex flex-row justify-center items-center gap-x-2 text-base"
                        >
                            Edit research plan
                            <Pencil />
                        </Button>
                    }
                </div>
            </CardHeader>

            <CardContent className="px-8">
                {(roadmaps && roadmaps.length > 0) 
                    ? <RoadmapsTable 
                        roadmaps={roadmaps} 
                        rowClickCallback={(roadmap) => 
                            router.push(organization.subdomain ? `http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${roadmap.id}` : '#')
                        }
                    />
                    : (pathname === "/app/profile" 
                        ? <PrivateNoResearchPlansColumn />
                        : <PublicNoResearchPlans organizationName={organization.name}/>
                    )
                }
            </CardContent>
        </Card>
    )
}

export const RoadmapCard = ({
    roadmap, 
    urlMilestone, 
    setUrlMilestone, 
    urlView,
    setUrlView,
    subdomain, 
    isPublic,
    externalLinks
}: { 
    roadmap: any, 
    urlMilestone?: string | undefined,
    setUrlMilestone?: (id: string | undefined) => void,
    urlView?: string | undefined,
    setUrlView?: (view: string | undefined) => void,
    subdomain: string | undefined, 
    isPublic: boolean ,
    externalLinks: boolean
}) => {
    if (!roadmap) {
        return <PublicNoResearchPlans />
    }

    if (roadmap?.milestones && roadmap.milestones.length <= 0) {
        return <NoProjectsCard isPublic={isPublic} />
    }

    return (
        <Tabs
            defaultValue={urlView === 'flow' ? 'flow' : 'timeline'}
            className="w-full"
            onValueChange={setUrlView ? setUrlView: () => {}}
        >
            <Card className="organization-profile-tour-step4">
                <CardHeader className="w-full pt-6 pb-2 space-y-4">
                    <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">
                        {roadmap.title || 'Untitled Research Plan'}
                    </CardTitle>
                    <CardDescription>
                        {roadmap.description}
                    </CardDescription>
                    <div className="flex gap-2">
                        {RESEARCH_PLAN_TYPES.filter(typeOption => roadmap.modalities.includes(typeOption.value)).map((type: Option) => <Badge variant={'secondary'} className="text-sm">{type.label}</Badge>)}
                        <StageOfActivityBadge milestones={roadmap.milestones}/>
                    </div>

                    <TabsList className="w-min">
                        <TabsTrigger value="timeline">
                            Timeline View
                        </TabsTrigger>
                        <TabsTrigger value="flow">
                            Flow View
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>

                <CardContent className="px-8">
                    <TabsContent value="timeline" className="space-y-4 w-full">
                        <PublicTimelineView 
                            roadmap={roadmap} 
                            subdomain={subdomain}
                            externalLinks={externalLinks}
                            urlMilestone={urlMilestone}
                            setUrlMilestone={setUrlMilestone}
                        />
                    </TabsContent>
                    <TabsContent value="flow" className="space-y-4 w-full">
                        <div className="h-[40vh] w-full">
                            <PublicFlowView 
                                roadmap={roadmap} 
                                subdomain={subdomain}
                                urlMilestone={urlMilestone || undefined} 
                                setUrlMilestone={setUrlMilestone || undefined}
                                externalLinks={externalLinks}
                            />
                        </div>
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
};

export const NoProjectsCard = ({isPublic}: {isPublic: Boolean}) => {
    const router = useRouter()
    
    return (
        <Card className="organization-profile-tour-step4">
            <CardContent className="px-8 pt-4">
                <NoProjects />
            </CardContent>
        </Card>
    )
}

export const RoadmapsTable = ({roadmaps, rowClickCallback}: {roadmaps: any[], rowClickCallback: (roadmap: any) => void}) => {
    const router = useRouter()

    return (
        <Table>
            <TableHeader>
                <TableRow className="pointer-events-none">
                <TableHead className="w-full">Title & Description</TableHead>
                <TableHead className="w-fit text-nowrap">Stage of Activity</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {RESEARCH_PLAN_TYPES.map(type => {
                    const roadmapsForModality = roadmaps.filter(roadmap => roadmap.modalities.includes(type.value) && type.value !== "OTHER")
                    if (roadmapsForModality.length <= 0) return <></>

                    return (
                        // add a section for each roadmap type EXCEPT the OTHER type (handled below)
                        <CollapsibleTableGroup 
                            label={type.label}
                            colSpan={2}
                        >
                            {roadmapsForModality.map(roadmap => (
                                <TableRow key={roadmap.id} className="cursor-pointer" onClick={() => rowClickCallback(roadmap)}>
                                    <TableCell>
                                        <p className="font-semibold">{roadmap.title || 'Untitled Research Plan'}</p>
                                        {roadmap.description && (
                                            <p className="line-clamp-2 text-muted-foreground">{roadmap.description}</p>
                                        )}
                                    </TableCell>
                                    <TableCell className="flex justify-end items-center">
                                        <StageOfActivityBadge milestones={roadmap.milestones} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </CollapsibleTableGroup>
                    )
                })}
                {roadmaps.filter(roadmap => roadmap.modalities.length === 0).length > 0 && (
                    // group research plans with no type or 'other' type together in the table
                    <CollapsibleTableGroup 
                        label={'Other'}
                        colSpan={2}
                    >
                        {roadmaps.filter(roadmap => roadmap.modalities.length === 0 || roadmap.modalities.includes("OTHER")).map(roadmap => (
                            <TableRow key={roadmap.id} className="cursor-pointer" onClick={() => rowClickCallback(roadmap)}>
                                <TableCell>
                                    <p className="font-semibold">{roadmap.title || 'Untitled Research Plan'}</p>
                                    {roadmap.description && (
                                        <p className="line-clamp-2 text-muted-foreground">{roadmap.description}</p>
                                    )}
                                </TableCell>
                                <TableCell className="flex justify-end items-center">
                                    <StageOfActivityBadge milestones={roadmap.milestones} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </CollapsibleTableGroup>
                )}
                {roadmaps.length <= 0 && (
                    <div className="p-4">
                        <PrivateNoResearchPlansRow />
                    </div>
                )}
            </TableBody>
        </Table>
    )
}

export const CollapsibleTableGroup = ({label, colSpan, children}: {label: string, colSpan: number, children?: React.ReactNode}) => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <>
            <TableRow 
                data-state={undefined} 
                className="!appearance-none cursor-pointer bg-gray-50"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <TableCell colSpan={colSpan} className="p-2">
                    <div className="flex gap-2 justify-between items-center">
                        {label}
                        <ChevronsUpDown className="h-4 w-4"/>
                    </div>
                </TableCell>
            </TableRow>
            {isOpen && (children)}
        </>
    )
}

const milestoneCategories = {
    'PLANNING': {
        option: {value: 'PLANNING', label: 'Planning', variant: 'amber'},
        types: []
    },
    'DATA_COLLECTION': {
        option: {value: 'DATA_COLLECTION', label: 'Patient Data Collection', variant: 'yellow'},
        types: ['NATURALHISTORYSTUDY', 'PATIENTREGISTRY', 'OUTCOMEMEASURE']
    },
    'DISCOVERY': {
        option: {value: 'DISCOVERY', label: 'Discovery', variant: 'lime'},
        types: ['BASICSCIENCE', 'FUNCTIONALSTUDY', 'BIOMARKER', 'TARGETVALIDATION', 'DRUGSCREEN']
    },
    'DISEASE_MODELS': {
        option: {value: 'DISEASE_MODELS', label: 'Disease Models', variant: 'emerald'},
        types: ['BIOBANK', 'PATIENTDERIVEDCELLLINE', 'ENGINEEREDCELLLINE', 'MOUSEMODEL', 'OTHERDISEASEMODEL']
    },
    'DESIGN_MANUFACTURING': {
        option: {value: 'DESIGN_MANUFACTURING', label: 'Design & Manufacturing', variant: 'cyan'},
        types: ['GENETHERAPYPRODUCTION', 'GPMANUFACTURING']
    },
    'PRECLINICAL': {
        option: {value: 'PRECLINICA', label: 'Preclinical', variant: 'indigo'},
        types: ['ASSAYDEVELOPMENT', 'EFFICASYSTUDY', 'DOSEFINDINGSTUDY', 'TOXICOLOGYSTUDY', 'BIODISTRIBUTIONSTUDY']
    },
    'CLINICAL_TRIAL': {
        option: {value: 'CLINICAL_TRIAL', label: 'Clinical Trial', variant: 'purple'},
        types: ['SITESELECTION', 'PATIENTRECRUITMENT', 'TRIALDESIGN', 'PHASE1', 'PHASE1/2', 'PHASE2', 'PHASE3', 'PHASE4']
    },
    'REGULATORY': {
        option: {value: 'REGULATORY', label: 'Regulatory', variant: 'pink'},
        types: ['INTERACTMEETING', 'PREINDMEETING', 'INDSUBMISSION', 'FDAAPPROVAL']
    },
}

export const getStage = (milestones: Milestone[]): {value: string, label: string, variant: string} => {
    const relevantMilestoneTypes = milestones
        .filter(milestone => milestone.status === "INPROGRESS" && !milestone.private)
        .flatMap(milestone => milestone.types)
        .map(type => type?.milestoneTypeId)

    // if the research plan has no public milestones in progress we consider it in the 'planning' stage
    // if the research plan has ONLY data collection milestones we consider it in the 'data collection' stage
    const option = relevantMilestoneTypes
        .filter(value => milestoneCategories['DATA_COLLECTION'].types.includes(value)).length > 0 
            ? 'DATA_COLLECTION' 
            : 'PLANNING'

    // we've already handled Data Collection and Planning options, so filter them out of the types check
    const categoryKeys = (Object.keys(milestoneCategories))
        .filter(key => key !== 'DATA_COLLECTION' && key !== 'PLANNING')

    // iterate from end of list to beginning - furthest along option with a relevant milestone type is returned
    for (let i = categoryKeys.length - 1; i >= 0; i--) {
        const key = (categoryKeys as (keyof (typeof milestoneCategories))[])[i]
        const currentCategory = milestoneCategories[key]
        
        if (currentCategory.types.filter(type => relevantMilestoneTypes.includes(type)).length > 0) {
            return currentCategory.option
        }
    }

    return milestoneCategories[option].option
}

export const StageOfActivityBadge = ({milestones}: {milestones: Milestone[]}) => {
    const stage = getStage(milestones)
    return (
        <Badge variant={stage.variant as any} className="text-sm">{stage.label}</Badge>
    )
}
