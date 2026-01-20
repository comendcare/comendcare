"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {cn, getStage} from "@comend/lib/utils";
import "@xyflow/react/dist/base.css"
import {PublicFlowView} from "./public-flow";
import {PublicTimelineView} from "./public-timeline";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@comend/components/ui/tabs";
import {Button} from "@comend/components/ui/button";
import {ChevronsUpDown, FileText, Globe, Lock, Pencil} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@comend/components/ui/table";
import {Milestone, Option, RESEARCH_PLAN_STATUS, RESEARCH_PLAN_TYPES, RESEARCH_STAGE} from "@comend/lib/types";
import {Badge} from "@comend/components/ui/badge";
import type {Organization} from "@prisma/client";
import {NoProjects} from "./no-projects";
import {useState} from "react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@comend/components/ui/tooltip";
import { PropertyBadge } from "@comend/components/property-badge";
import { NoResultsTemplate } from "@comend/components/no-results";

export const RoadmapsCard = ({
                                 roadmaps,
                                 organization,
                             }: {
    roadmaps: any[],
    organization: Partial<Organization>,
}) => {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <Card className="organization-profile-tour-step4 w-full" data-testid="roadmaps-card">
            <CardHeader className="w-full pt-6 pb-2 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-0">
                    <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight" data-testid="roadmaps-heading">
                        Research plans
                    </CardTitle>
                    {pathname === "/app/profile" &&
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/app/research-plan")}
                            className="inline-flex flex-row justify-center items-center gap-x-2 text-base"
                        >
                            Edit research plan
                            <Pencil/>
                        </Button>
                    }
                </div>
            </CardHeader>

            <CardContent className="px-8">
                {(roadmaps && roadmaps.length > 0)
                    ? <RoadmapsTable
                        isPrivate={false}
                        roadmaps={roadmaps}
                        rowClickCallback={(roadmap) =>
                            router.push(organization.subdomain ? `http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${roadmap?.id}` : '#')
                        }
                    />
                    : (pathname === "/app/profile"
                            ? (
                                <NoResultsTemplate 
                                    imgAlt="No research plans"
                                    src="https://illustrations.popsy.co/gray/studying.svg"
                                    title="Your organization does not have any public research plans yet."
                                />
                            )
                            : (
                                <NoResultsTemplate 
                                    imgAlt="No research plans"
                                    src="https://illustrations.popsy.co/gray/studying.svg"
                                    title="No research plans yet"
                                    description={organization.name ? `${organization.name} doesn't have any public research plans yet.`: `This organization doesn't have any public research plans yet.`}
                                />
                            )
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
                                organization,
                                externalLinks
                            }: {
    roadmap: any,
    urlMilestone?: string | undefined,
    setUrlMilestone?: (id: string | undefined) => void,
    urlView?: string | undefined,
    setUrlView?: (view: string | undefined) => void,
    subdomain: string | undefined,
    isPublic: boolean,
    organization?: Partial<Organization>,
    externalLinks: boolean
}) => {
    const params = useSearchParams()
    if (!roadmap) {
        return (
            <NoResultsTemplate 
                imgAlt="No research plans"
                src="https://illustrations.popsy.co/gray/studying.svg"
                title="No research plans yet"
                description={`This organization doesn't have any public research plans yet.`}
            />
        )
    }

    if (roadmap?.milestones && roadmap.milestones.length <= 0) {
        return <NoProjectsCard isPublic={isPublic}/>
    }

    return (
        <Tabs
            // defaultValue={urlView === 'flow' || params.get('view') === 'flow' ? 'flow' : 'list'} // list default
            // defaultValue={urlView === 'list' || params.get('view') === 'list' ? 'list' : 'flow'} // flow default
            value={urlView === 'list' || params.get('view') === 'list' ? 'list' : 'flow'}
            className="w-full"
            onValueChange={setUrlView ? setUrlView : () => {
            }}
        >
            <Card className="organization-profile-tour-step4 flex flex-col gap-0">
                <CardHeader className="w-full pt-6 pb-0 space-y-4">
                    <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        {roadmap.title || 'Untitled Research Plan'}
                    </CardTitle>
                    <CardDescription>
                        {roadmap.description}
                    </CardDescription>
                    {/* <div className="flex gap-2">
                        {RESEARCH_PLAN_TYPES.filter(typeOption => (roadmap.modalities || []).includes(typeOption.value)).map((type: Option, index) =>
                            <ResearchPlanTypeBadge key={index} label={type.label}/>)}
                        <StageOfActivityBadge showTooltip={false} milestones={roadmap.milestones}/>
                    </div> */}
                    <div className="flex gap-2 flex-wrap">
                        {RESEARCH_PLAN_TYPES.filter(modality => roadmap.modalities.includes(modality.value)).map(m => (
                            <Badge variant={"secondary"} className="text-sm">{m.label}</Badge>
                        ))}
    
                        {RESEARCH_STAGE.filter(stage => roadmap.stages.includes(stage.value)).map(s => (
                            <Badge variant={"secondary"} className="text-sm">{s.label}</Badge>
                        ))}
    
                        {RESEARCH_PLAN_STATUS.filter(status => roadmap.statuses.includes(status.value)).map(s => (
                            <Badge variant={"secondary"} className="text-sm">{s.label}</Badge>
                        ))}
                    </div>

                    <TabsList className="w-min rounded-t-md rounded-b-none z-10 -py-2">
                        <TabsTrigger value="flow" className="data-[state=active]:shadow-none rounded-b-none -mb-2 py-2.5">
                            Flow view
                        </TabsTrigger>
                        <TabsTrigger value="list" className="data-[state=active]:shadow-none rounded-b-none -mb-2 py-2.5">
                            List view
                        </TabsTrigger>
                    </TabsList>
                </CardHeader>

                <CardContent className="bg-secondary mx-6 mb-6 rounded-b-md rounded-r-md -mt-1 p-1">
                    <TabsContent value="flow" className="w-full p-0 mt-0">
                        <div className="h-[60vh] w-full bg-white rounded-b-md rounded-r-md">
                            <PublicFlowView
                                roadmap={roadmap}
                                subdomain={subdomain}
                                urlMilestone={urlMilestone || undefined}
                                setUrlMilestone={setUrlMilestone || undefined}
                                externalLinks={externalLinks}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="list" className="w-full p-0 mt-0">
                        <PublicTimelineView
                            roadmap={roadmap}
                            subdomain={subdomain}
                            externalLinks={externalLinks}
                            urlMilestone={urlMilestone}
                            organization={organization}
                            setUrlMilestone={setUrlMilestone}
                        />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
};

export const NoProjectsCard = ({isPublic}: { isPublic: Boolean }) => {
    const router = useRouter()

    return (
        <Card className="organization-profile-tour-step4">
            <CardContent className="px-8 pt-4">
                <NoProjects/>
            </CardContent>
        </Card>
    )
}

export const RoadmapsTable = ({roadmaps, rowClickCallback, isPrivate}: {
    isPrivate: boolean,
    roadmaps: any[],
    rowClickCallback: (roadmap: any) => void
}) => {
    const MODALITY_OPTIONS = RESEARCH_PLAN_TYPES.map(type => type.value)
    const otherRoadmaps = roadmaps.filter(roadmap => (
        roadmap.modalities.filter((modality: string) => MODALITY_OPTIONS.includes(modality)).length <= 0 ||
        roadmap.modalities.includes("OTHER")
    ))

    return (
        <Table>
            <TableHeader className="px-0">
                <TableRow className="pointer-events-none px-0">
                    <TableHead className="w-full px-0">Therapeutic strategy</TableHead>
                    <TableHead></TableHead>
                    <TableHead className="self-end text-right w-fit text-nowrap px-0">Stage</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {RESEARCH_PLAN_TYPES.map((type, index) => {
                    const roadmapsForModality = roadmaps.filter(roadmap => (roadmap.modalities || []).includes(type.value) && type.value !== "OTHER")
                    if (roadmapsForModality.length <= 0) return <></>

                    return (
                        // add a section for each roadmap type EXCEPT the OTHER type (handled below)
                        <CollapsibleTableGroup
                            key={index}
                            label={type.label}
                            colSpan={3}
                            disabled={true}
                        >
                            {roadmapsForModality.map(roadmap => (
                                <RoadmapRow 
                                    isPrivate={isPrivate}
                                    roadmap={roadmap}
                                    rowClickCallback={rowClickCallback}
                                />
                            ))}
                        </CollapsibleTableGroup>
                    )
                })}
                {otherRoadmaps && otherRoadmaps.length > 0 && (
                    // group research plans with no type or 'other' type together in the table
                    <CollapsibleTableGroup
                        label={'Other'}
                        colSpan={3}
                        disabled={true}
                    >
                        {otherRoadmaps.map(roadmap => (
                            <RoadmapRow 
                                isPrivate={isPrivate}
                                roadmap={roadmap}
                                rowClickCallback={rowClickCallback}
                            />
                        ))}
                    </CollapsibleTableGroup>
                )}
                {roadmaps.length <= 0 && (
                    <div className="w-full flex justify-center p-4">
                        <NoResultsTemplate 
                            imgAlt="No research plans"
                            src="https://illustrations.popsy.co/gray/studying.svg"
                            title="No research plans yet!"
                            description="Your organization does not have any public research plans yet."
                        />
                    </div>
                )}
            </TableBody>
        </Table>
    )
}

export const RoadmapRow = ({roadmap, rowClickCallback, isPrivate}: {roadmap: any, rowClickCallback: (roadmap: any) => void, isPrivate: boolean}) => {
    const numProjects = roadmap.milestones.length
    const numPrivateProjects = roadmap.milestones.filter((milestone: any) => milestone.private).length
    const numPublishedProjects = roadmap.milestones.filter((milestone: any) => !milestone.private).length

    return (
        <TableRow 
            key={roadmap?.id} 
            className="cursor-pointer px-0"
            onClick={() => rowClickCallback(roadmap)}
        >
            <TableCell className="pl-0">
                <p className="font-semibold">{roadmap.title || 'Untitled Research Plan'}</p>
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-2 justify-center text-nowrap">
                    {isPrivate && numPrivateProjects > 0 && (
                        <PropertyBadge 
                            className="text-nowrap border-red-200 text-red-900 font-semibold" 
                            icon={Lock}
                        >
                            {numPrivateProjects === 1 ? `${numPrivateProjects} private project` : `${numPrivateProjects} private projects`}
                        </PropertyBadge>
                    )}
                    {isPrivate && numPublishedProjects > 0 && (
                        <PropertyBadge 
                            className="text-nowrap border-green-200 text-green-900 font-semibold" 
                            icon={Globe}
                        >
                            {numPublishedProjects === 1 ? `${numPublishedProjects} published project` : `${numPublishedProjects} published projects`}
                        </PropertyBadge>
                    )}
                    {!isPrivate && numProjects > 0 && (
                        <PropertyBadge 
                            className="text-nowrap border-purple-200 text-purple-900 font-semibold" 
                            icon={FileText}
                        >
                            {numProjects === 1 ? `${numProjects} project` : `${numProjects} projects`}
                        </PropertyBadge>
                    )}
                </div>
            </TableCell>
            <TableCell className="pr-0">
                <div className="flex gap-2 justify-end items-center text-nowrap">
                    <StageOfActivityBadge showTooltip={false} milestones={roadmap.milestones}/>
                </div>
            </TableCell>
        </TableRow>
    )
}

export const CollapsibleTableGroup = ({label, colSpan, disabled = false, children}: {
    label: string,
    colSpan: number,
    disabled?: boolean
    children?: React.ReactNode
}) => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <>
            <TableRow
                data-state={undefined}
                className={cn(
                    "!appearance-none bg-gray-50",
                    (!disabled && "cursor-pointer")
                )}
                onClick={() => {
                    if (!disabled) setIsOpen(prev => !prev)
                }}
            >
                <TableCell colSpan={colSpan} className="p-2">
                    <div className="flex gap-2 justify-between items-center">
                        {label}
                        {!disabled && <ChevronsUpDown className="h-4 w-4"/>}
                    </div>
                </TableCell>
            </TableRow>
            {isOpen && (children)}
        </>
    )
}

export const StageOfActivityBadge = ({milestones, showTooltip = true}: { milestones: Milestone[], showTooltip?: boolean }) => {
    const stage = getStage(milestones)

    return (showTooltip ? (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Badge variant={stage.variant as any} className="text-sm">{stage.label}</Badge>
                </TooltipTrigger>

                <TooltipContent className="max-w-80">
                    Stage
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ) : (
        <Badge variant={stage.variant as any} className="text-sm">{stage.label}</Badge> 
    ))
}

export const ResearchPlanTypeBadge = ({label}: { label: string }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Badge variant={'secondary'} className="text-sm">{label}</Badge>
                </TooltipTrigger>

                <TooltipContent className="max-w-80">
                    Therapeutic approach
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
